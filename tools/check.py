#!/usr/bin/env python3
"""Safety check. Runs before every publish; exit code 0 = safe, 1 = problems found.

What it checks:
  * Every file that would go to GitHub, plus the built website (site/) and the PDFs (worksheets/):
      - no private words (her name, family names, business names, the parent folder name);
      - no folder paths from the Mac, no links to local files;
      - nothing that looks like a password, key or token.
  * The website (site/) only:
      - no outside links or outside files (no http/https addresses), no forms, frames or inline scripts;
      - every page asks search engines not to index it, and carries the strict content policy;
      - robots.txt blocks all search engines;
      - file names are plain lower-case letters, numbers and dashes; no photos (JPEG/HEIC).
  * PDFs: the same word and path checks on their text, metadata and links.

Private words come from tools/private-words.txt (on the Mac, never in Git) or, on GitHub,
from the PRIVATE_WORDS secret.

Run:  python3 tools/check.py        on the Mac
      python3 tools/check.py --ci   on GitHub (the private file does not exist there)
"""
from __future__ import annotations

import os
import re
import subprocess
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
WORKSHEETS = ROOT / "worksheets"
PRIVATE_FILE = ROOT / "tools" / "private-words.txt"

# Built from pieces so this file does not trip its own check.
MAC_PATH = "/" + "Users" + "/"
FILE_URL = "file" + "://"

NAMESPACES = {"http://www.w3.org/2000/svg", "http://www.w3.org/1999/xlink", "http://www.w3.org/1999/xhtml"}
URL_RE = re.compile(r"https?://[^\s\"'<>)\\]+", re.I)
SECRET_RES = [
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"\bgh[pousr]_[A-Za-z0-9]{30,}"),
    re.compile(r"\bgithub_pat_[A-Za-z0-9_]{20,}"),
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    re.compile(r"\bsk-[A-Za-z0-9_-]{24,}"),
]
TEXT_SUFFIXES = {".html", ".css", ".js", ".json", ".webmanifest", ".txt", ".md", ".svg", ".yml",
                 ".yaml", ".py", ".xml", ".gitignore", ""}
SITE_SUFFIXES = {".html", ".css", ".js", ".json", ".webmanifest", ".txt", ".png", ".svg", ".pdf",
                 ".woff2", ".ico", ""}
SITE_NAME_RE = re.compile(r"^[a-z0-9][a-z0-9._-]*$")
SITE_SPECIAL_NAMES = {".nojekyll"}

problems: list[str] = []


def problem(where: Path | str, what: str) -> None:
    rel = where.relative_to(ROOT).as_posix() if isinstance(where, Path) else where
    problems.append(f"{rel}: {what}")


def load_private_words(ci: bool) -> list[str]:
    words: list[str] = []
    if PRIVATE_FILE.exists():
        words += PRIVATE_FILE.read_text(encoding="utf-8").splitlines()
    env = os.environ.get("PRIVATE_WORDS", "")
    words += re.split(r"[\n,]", env)
    words = [w.strip() for w in words if w.strip() and not w.strip().startswith("#")]
    if not words:
        if ci:
            print("WARNING: no private words available (PRIVATE_WORDS secret not set): skipping that part.")
        else:
            problem("tools/private-words.txt", "missing or empty: cannot check for private words")
    return words


def scan_text(where: Path, text: str, words: list[str], label: str = "") -> None:
    low = text.casefold()
    for w in words:
        if w.casefold() in low:
            problem(where, f"contains a private word{label}")
            break
    if MAC_PATH.casefold() in low:
        problem(where, f"contains a Mac folder path{label}")
    if FILE_URL in low:
        problem(where, f"contains a link to a local file{label}")
    for rx in SECRET_RES:
        if rx.search(text):
            problem(where, f"contains something that looks like a key or token{label}")
            break


def scan_name(where: Path, words: list[str]) -> None:
    low = where.relative_to(ROOT).as_posix().casefold()
    for w in words:
        if w.casefold() in low:
            problem(where, "file or folder name contains a private word")
            break


def repo_files() -> list[Path]:
    """Every file that Git would upload: tracked files plus new files that are not ignored."""
    try:
        out = subprocess.run(["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
                             cwd=ROOT, capture_output=True, check=True).stdout
    except (OSError, subprocess.CalledProcessError):
        problem("(git)", "could not list the files that would go to GitHub")
        return []
    return [ROOT / p for p in out.decode().split("\0") if p and (ROOT / p).is_file()]


def pdf_texts(data: bytes) -> list[str]:
    """Raw bytes, decompressed streams and decoded strings of a PDF, as text to scan."""
    chunks = [data]
    for m in re.finditer(rb"stream\r?\n(.*?)\r?\nendstream", data, re.S):
        try:
            chunks.append(zlib.decompress(m.group(1)))
        except zlib.error:
            pass
    texts = []
    for c in chunks:
        texts.append(c.decode("latin-1"))
        for h in re.findall(rb"<FEFF([0-9A-Fa-f]+)>", c):
            try:
                texts.append(bytes.fromhex(h.decode()).decode("utf-16-be", "ignore"))
            except ValueError:
                pass
        for s in re.findall(rb"\(\xfe\xff((?:[^)\\]|\\.)*)\)", c, re.S):
            texts.append(s.decode("utf-16-be", "ignore"))
    texts += pdf_visible_text(chunks)
    return texts


def parse_cmap(c: bytes) -> dict[int, str]:
    """Glyph code -> Unicode text, from a PDF ToUnicode CMap (how Chrome stores the real letters)."""
    m: dict[int, str] = {}

    def uni(h: bytes) -> str:
        try:
            return bytes.fromhex(h.decode()).decode("utf-16-be", "ignore")
        except ValueError:
            return ""
    for block in re.findall(rb"beginbfchar(.*?)endbfchar", c, re.S):
        for src, dst in re.findall(rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", block):
            m[int(src, 16)] = uni(dst)
    for block in re.findall(rb"beginbfrange(.*?)endbfrange", c, re.S):
        for lo, hi, rest in re.findall(rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(<[0-9A-Fa-f]+>|\[[^\]]*\])", block):
            lo_i, hi_i = int(lo, 16), int(hi, 16)
            if rest.startswith(b"["):
                for i, d in enumerate(re.findall(rb"<([0-9A-Fa-f]+)>", rest)):
                    m[lo_i + i] = uni(d)
            else:
                start = uni(rest[1:-1])
                if start:
                    for i in range(min(hi_i - lo_i + 1, 4096)):
                        m[lo_i + i] = start[:-1] + chr(ord(start[-1]) + i)
    return m


def pdf_visible_text(chunks: list[bytes]) -> list[str]:
    """The text printed on the pages (including any header/footer), decoded with each font's CMap."""
    cmaps = [parse_cmap(c) for c in chunks if b"begincmap" in c]
    contents = [c for c in chunks if re.search(rb"\b(Tj|TJ)\b", c)]
    out = []
    for cmap in cmaps:
        if not cmap:
            continue
        width = 2 if max(cmap) > 0xFF else 1
        for content in contents:
            pieces = []
            for h in re.findall(rb"<([0-9A-Fa-f]+)>", content):
                raw = bytes.fromhex(h.decode()) if len(h) % 2 == 0 else b""
                pieces.append("".join(cmap.get(int.from_bytes(raw[i:i + width], "big"), "")
                                      for i in range(0, len(raw), width)))
            text = "".join(pieces)
            if text:
                out += [text, re.sub(r"\s+", "", text)]
    return out


def check_pdf(path: Path, words: list[str]) -> None:
    data = path.read_bytes()
    squeezed_words = [re.sub(r"\s+", "", w) for w in words]
    for text in pdf_texts(data):
        scan_text(path, text, words + squeezed_words, " (inside the PDF)")
        for uri in re.findall(r"/URI\s*\(([^)]*)\)", text):
            if re.match(r"[a-z][a-z0-9+.-]*:", uri, re.I):
                problem(path, f"PDF contains a link to {uri[:60]!r}")


def check_html(path: Path, text: str) -> None:
    low = text.lower()
    if not re.search(r'<meta\s+name="robots"\s+content="noindex,\s*nofollow"', low):
        problem(path, "missing the noindex meta tag")
    if "content-security-policy" not in low:
        problem(path, "missing the content security policy")
    for tag in ("form", "iframe", "object", "embed", "base"):
        if re.search(rf"<{tag}[\s>]", low):
            problem(path, f"contains a <{tag}> element")
    for m in re.finditer(r"<script\b([^>]*)>(.*?)</script>", text, re.S | re.I):
        if "src=" not in m.group(1).lower() or m.group(2).strip():
            problem(path, "contains an inline script (scripts must be separate .js files)")
    if re.search(r"<[^>]+\son[a-z]+\s*=", text, re.I):
        problem(path, "contains an inline event handler (onclick=...)")
    for m in re.finditer(r"""\s(?:src|href|action|poster|srcset|xlink:href)\s*=\s*["']([^"']*)["']""", text, re.I):
        v = m.group(1).strip()
        if v.startswith("//") or (re.match(r"[a-z][a-z0-9+.-]*:", v, re.I) and not v.startswith("data:image/")):
            problem(path, f"links outside the site: {v[:60]!r}")


def check_site(words: list[str]) -> int:
    if not SITE.exists():
        problem(SITE, "the built website is missing: run tools/build.py first")
        return 0
    robots = SITE / "robots.txt"
    if not robots.exists() or "disallow: /\n" not in robots.read_text(encoding="utf-8").lower() + "\n":
        problem(robots, "robots.txt must block all search engines (Disallow: /)")
    count = 0
    for path in sorted(p for p in SITE.rglob("*") if p.is_file()):
        count += 1
        rel_parts = path.relative_to(SITE).parts
        for part in rel_parts:
            if part not in SITE_SPECIAL_NAMES and not SITE_NAME_RE.match(part):
                problem(path, "name must use only a-z, 0-9, '-', '_' and '.' (no capitals, spaces or Turkish letters)")
                break
        if path.suffix.lower() not in SITE_SUFFIXES:
            problem(path, f"file type {path.suffix!r} is not allowed on the website (photos are not allowed)")
        scan_name(path, words)
        if path.suffix.lower() == ".pdf":
            check_pdf(path, words)
            continue
        data = path.read_bytes()
        if path.suffix.lower() in TEXT_SUFFIXES:
            text = data.decode("utf-8", "replace")
            scan_text(path, text, words)
            for url in URL_RE.findall(text):
                if url.rstrip("\"'") not in NAMESPACES:
                    problem(path, f"contains an outside address: {url[:60]!r}")
            if path.suffix.lower() == ".html":
                check_html(path, text)
            if path.suffix.lower() == ".css" and re.search(r"@import|url\(\s*['\"]?(?:[a-z]+:|//)", text, re.I):
                problem(path, "CSS loads something from outside the site")
        else:
            scan_text(path, data.decode("latin-1"), words)
    return count


def main() -> int:
    ci = "--ci" in sys.argv
    words = load_private_words(ci)
    seen: set[Path] = set()

    site_count = check_site(words)
    seen.update(p for p in SITE.rglob("*") if p.is_file()) if SITE.exists() else None

    pdfs = sorted(WORKSHEETS.rglob("*.pdf")) if WORKSHEETS.exists() else []
    for pdf in pdfs:
        scan_name(pdf, words)
        check_pdf(pdf, words)
        seen.add(pdf)

    repo = repo_files()
    for path in repo:
        if path in seen:
            continue
        scan_name(path, words)
        if path.suffix.lower() == ".pdf":
            check_pdf(path, words)
            continue
        data = path.read_bytes()
        if path.suffix.lower() in TEXT_SUFFIXES or path.name.startswith("."):
            scan_text(path, data.decode("utf-8", "replace"), words)
        else:
            scan_text(path, data.decode("latin-1"), words)

    if problems:
        print(f"SAFETY CHECK FAILED: {len(problems)} problem(s). Nothing should be published until fixed.")
        for p in problems:
            print("  -", p)
        return 1
    print(f"SAFETY CHECK PASSED: {site_count} website files, {len(pdfs)} PDFs, "
          f"{len(repo)} files going to GitHub, {len(words)} private words checked.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
