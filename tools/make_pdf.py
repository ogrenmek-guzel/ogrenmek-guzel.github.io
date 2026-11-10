#!/usr/bin/env python3
"""Print PDF worksheets (and their answer keys) with Google Chrome, already installed on the Mac.

Run:  python3 tools/make_pdf.py                       every PDF item in every topic
      python3 tools/make_pdf.py <item folder> [...]   only these, e.g.
            python3 tools/make_pdf.py math/09-butun-yarim-ceyrek/worksheet-01-butun-yarim-ceyrek

Source of a PDF item (kind worksheet, revision, explainer or story in topic.json):
  <section>/<NN-topic>/<slug>/print.html   (plus its own .css / .js; it may use files of a lesson
                                            folder in the same topic, e.g. ../lesson-01-.../draw.js)
Output: worksheets/<section>/<NN-topic>/<slug>.pdf
        and, when the item has "answers": true, <slug>-answers.pdf: the same page opened with
        "?answers" at the end of its address, so the page can show the answers (for parents).

Always prints with --no-pdf-header-footer: without it Chrome would print the Mac's folder path and
the date on every page. Uses a fresh, empty Chrome profile in a temporary folder (the parent's own
Chrome is not touched). Uses only Python's standard library.
"""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKSHEETS = ROOT / "worksheets"
SECTIONS = ("math", "english/school", "english/private")
PDF_KINDS = ("worksheet", "revision", "explainer", "story")
CHROME = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")


def find_items(args: list[str]) -> list[tuple[str, Path, dict]]:
    """(section, item folder, item from topic.json) for every PDF item asked for."""
    wanted = {(ROOT / a).resolve() for a in args}
    found = []
    for section in SECTIONS:
        base = ROOT / section
        if not base.is_dir():
            continue
        for meta in sorted(base.glob("*/topic.json")):
            topic = json.loads(meta.read_text(encoding="utf-8"))
            for item in topic.get("items", []):
                if item.get("kind") not in PDF_KINDS:
                    continue
                folder = meta.parent / item["slug"]
                if wanted and folder.resolve() not in wanted:
                    continue
                found.append((section, folder, item))
    missing = wanted - {f.resolve() for _, f, _ in found}
    for m in sorted(missing):
        print(f"Not found in any topic.json as a PDF item: {m.relative_to(ROOT)}")
    return found


def print_pdf(page: Path, out: Path, query: str = "") -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp_out = out.with_name(out.name + ".tmp")
    with tempfile.TemporaryDirectory() as profile:
        cmd = [str(CHROME), "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
               "--no-first-run", "--no-default-browser-check", "--disable-extensions",
               f"--user-data-dir={profile}", "--virtual-time-budget=10000",
               "--run-all-compositor-stages-before-draw",
               f"--print-to-pdf={tmp_out}", page.as_uri() + query]
        subprocess.run(cmd, check=True, capture_output=True, timeout=120)
    if not tmp_out.exists() or tmp_out.stat().st_size < 1000:
        raise RuntimeError(f"Chrome did not make {out.relative_to(ROOT)}")
    tmp_out.replace(out)
    pages = out.read_bytes().count(b"/Type /Page") - out.read_bytes().count(b"/Type /Pages")
    print(f"  made {out.relative_to(ROOT)} ({pages} page{'s' if pages != 1 else ''})")


def main() -> int:
    if not CHROME.exists():
        print("Google Chrome was not found in Applications.")
        return 1
    items = find_items(sys.argv[1:])
    if not items:
        print("Nothing to print.")
        return 1
    for section, folder, item in items:
        page = folder / "print.html"
        if not page.exists():
            print(f"SKIPPED {folder.relative_to(ROOT)}: print.html is missing")
            continue
        out_dir = WORKSHEETS / section / folder.parent.name
        print(f"{folder.relative_to(ROOT)}:")
        print_pdf(page, out_dir / f"{item['slug']}.pdf")
        if item.get("answers"):
            print_pdf(page, out_dir / f"{item['slug']}-answers.pdf", "?answers")
    print("Done. Run tools/check.py to check the PDFs for private words and paths.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
