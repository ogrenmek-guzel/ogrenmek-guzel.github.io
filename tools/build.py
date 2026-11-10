#!/usr/bin/env python3
"""Build the website into site/ from _shared/, math/, english/ and worksheets/.

Run:  python3 tools/build.py            the public website, into site/ (drafts left out)
      python3 tools/build.py --preview  a private preview, into _preview/ (drafts included, marked)
Uses only Python's standard library. The output folder is deleted and rebuilt every time: never edit it by hand.

Drafts: add "draft": true to an item (or to the whole topic) in topic.json. Drafts appear only in the
preview, never on the website, and tools/publish.py keeps their files on the iMac until approved.

Lesson sources:
  <subject>/<NN-topic>/topic.json
      {"title": "Toplama İşlemi",
       "items": [{"kind": "lesson",    "slug": "lesson-01-...",    "title": "..."},
                 {"kind": "worksheet", "slug": "worksheet-01-...", "title": "...", "answers": true}]}
  <subject>/<NN-topic>/<lesson-slug>/lesson.html   (page content; lesson.css / lesson.js optional)
PDF kinds (worksheet, revision, explainer, story) are taken from worksheets/<subject>/<topic>/<slug>.pdf
and their answer keys from <slug>-answers.pdf.
"""
from __future__ import annotations

import hashlib
import html
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHARED = ROOT / "_shared"
SITE = ROOT / "site"
PREVIEW = ROOT / "_preview"
OUT = SITE
INCLUDE_DRAFTS = False
WORKSHEETS = ROOT / "worksheets"

APP_NAME = "Öğrenmek Güzel"
BG = "#FFF8EE"
PDF_KINDS = ("worksheet", "revision", "explainer", "story")
SKIP_IN_LESSON = {"lesson.html", "notes.md", "README.md", ".DS_Store"}

SUBJECTS = {
    "math": {
        "lang": "tr", "title": "Matematik", "home": "Ana sayfa", "topics": "Konular",
        "empty": "Yakında burada dersler olacak.", "activities": "Etkinlikler",
        "pdfs": "Yazdırılabilir sayfalar", "parents": "Veli için", "answers": "Cevap anahtarı",
        "kinds": {"worksheet": "Çalışma kâğıdı", "revision": "Tekrar", "explainer": "Konu anlatımı",
                  "story": "Hikâye"},
        "lesson_tag": "Başla", "draft": "TASLAK",
    },
    "english": {
        "lang": "en-US", "title": "English", "home": "Home", "topics": "Topics",
        "empty": "Lessons are coming soon.", "activities": "Activities",
        "pdfs": "Printable pages", "parents": "For parents", "answers": "Answer key",
        "kinds": {"worksheet": "Worksheet", "revision": "Revision", "explainer": "Explainer",
                  "story": "Story"},
        "lesson_tag": "Start", "draft": "DRAFT",
    },
}

MATH_ICON = (
    '<svg viewBox="0 0 120 120" aria-hidden="true">'
    '<g fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round">'
    '<path d="M30 16v32M14 32h32"/><path d="M74 32h32"/>'
    '<path d="M18 76l24 24M42 76l-24 24"/><path d="M74 88h32"/></g>'
    '<g fill="#fff"><circle cx="90" cy="72" r="6"/><circle cx="90" cy="104" r="6"/></g></svg>'
)
ENGLISH_ICON = (
    '<svg viewBox="0 0 120 120" aria-hidden="true">'
    '<path fill="#fff" d="M20 22h80a12 12 0 0 1 12 12v40a12 12 0 0 1-12 12H52l-22 18v-18H20'
    'A12 12 0 0 1 8 74V34a12 12 0 0 1 12-12z"/>'
    '<text x="60" y="65" text-anchor="middle" font-size="30" font-weight="700" fill="#D9480F" '
    'font-family="Avenir Next, Avenir, sans-serif">ABC</text></svg>'
)

TEMPLATE = (SHARED / "template.html").read_text(encoding="utf-8")
written: list[str] = []
warnings: list[str] = []
left_out: list[str] = []


def esc(value) -> str:
    return html.escape(str(value), quote=True)


def write(rel: str, data: str | bytes) -> None:
    out = OUT / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(data, bytes):
        out.write_bytes(data)
    else:
        out.write_text(data, encoding="utf-8")
    written.append(rel)


def copy(src: Path, rel: str) -> None:
    write(rel, src.read_bytes())


def draft_tag(subject: str, obj: dict) -> str:
    if not obj.get("draft"):
        return ""
    return f'<span class="tag tag-draft">{esc(SUBJECTS[subject]["draft"])}</span>'


def back(href: str, label: str) -> str:
    return f'<nav class="topbar"><a class="back" href="{href}">&larr; {esc(label)}</a></nav>'


def page(rel: str, *, lang: str, title: str, content: str, body_class: str = "",
         nav: str = "", head: str = "", scripts: str = "") -> None:
    depth = rel.count("/")
    root = "../" * depth if depth else "./"
    text = TEMPLATE
    for key, value in {
        "lang": lang, "title": esc(title), "app_name": esc(APP_NAME), "body_class": body_class,
        "nav": nav, "head": head, "scripts": scripts, "content": content,
    }.items():
        text = text.replace("{{" + key + "}}", value)
    write(rel, text.replace("{{root}}", root))


def load_topics(subject: str) -> list[dict]:
    topics = []
    folder = ROOT / subject
    for d in sorted(p for p in folder.iterdir() if p.is_dir()):
        meta = d / "topic.json"
        if not meta.exists():
            continue
        data = json.loads(meta.read_text(encoding="utf-8"))
        data["slug"], data["dir"] = d.name, d
        if data.get("draft") and not INCLUDE_DRAFTS:
            left_out.append(f"{subject}/{d.name} (whole topic)")
            continue
        items = []
        for item in data.get("items", []):
            if item.get("draft") and not INCLUDE_DRAFTS:
                left_out.append(f"{subject}/{d.name}/{item.get('slug')}")
            else:
                items.append(item)
        data["items"] = items
        topics.append(data)
    return topics


def build_home() -> None:
    content = f"""<header class="hero">
  <h1>{esc(APP_NAME)}</h1>
  <p>Bugün ne öğrenmek istersin?</p>
</header>
<nav class="subjects">
  <a class="subject subject-math" href="math/">{MATH_ICON}<span>Matematik</span></a>
  <a class="subject subject-english" href="english/" lang="en-US">{ENGLISH_ICON}<span>English</span></a>
</nav>"""
    page("index.html", lang="tr", title=APP_NAME, content=content)


def build_subject(subject: str) -> None:
    t = SUBJECTS[subject]
    topics = load_topics(subject)
    if topics:
        rows = "\n".join(
            f'  <li><a class="tile" href="{esc(tp["slug"])}/"><span class="num">{i}</span>'
            f'<span class="tile-text">{esc(tp["title"])}</span>{draft_tag(subject, tp)}</a></li>'
            for i, tp in enumerate(topics, start=1)
        )
        body = f'<h2>{esc(t["topics"])}</h2>\n<ul class="list">\n{rows}\n</ul>'
    else:
        body = f'<p class="empty">{esc(t["empty"])}</p>'
    page(f"{subject}/index.html", lang=t["lang"], title=f'{t["title"]} · {APP_NAME}',
         body_class=f"subject-page-{subject}", nav=back("../", t["home"]),
         content=f'<h1>{esc(t["title"])}</h1>\n{body}')
    for tp in topics:
        build_topic(subject, tp)


def build_lesson(subject: str, topic: dict, item: dict) -> bool:
    t = SUBJECTS[subject]
    src = topic["dir"] / item["slug"]
    frag = src / "lesson.html"
    if not frag.exists():
        warnings.append(f"{subject}/{topic['slug']}/{item['slug']}: lesson.html is missing, skipped")
        return False
    base = f"{subject}/{topic['slug']}/{item['slug']}/"
    for f in sorted(src.rglob("*")):
        if f.is_file() and f.name not in SKIP_IN_LESSON:
            copy(f, base + f.relative_to(src).as_posix())
    head = '<link rel="stylesheet" href="lesson.css">' if (src / "lesson.css").exists() else ""
    scripts = '<script src="lesson.js"></script>' if (src / "lesson.js").exists() else ""
    page(base + "index.html", lang=t["lang"], title=f'{item["title"]} · {APP_NAME}',
         body_class=f"subject-page-{subject} lesson-page", nav=back("../", topic["title"]),
         head=head, scripts=scripts,
         content=f'<h1>{esc(item["title"])}</h1>\n' + frag.read_text(encoding="utf-8"))
    return True


def build_topic(subject: str, topic: dict) -> None:
    t = SUBJECTS[subject]
    lessons, pdfs, answers = [], [], []
    for item in topic["items"]:
        kind = item.get("kind")
        if kind == "lesson":
            if build_lesson(subject, topic, item):
                lessons.append(
                    f'  <li><a class="tile" href="{esc(item["slug"])}/"><span class="tile-text">'
                    f'{esc(item["title"])}</span>{draft_tag(subject, item)}'
                    f'<span class="tag">{esc(t["lesson_tag"])}</span></a></li>')
        elif kind in PDF_KINDS:
            pdf = WORKSHEETS / subject / topic["slug"] / f'{item["slug"]}.pdf'
            if not pdf.exists():
                warnings.append(f"{pdf.relative_to(ROOT)} is missing, not listed")
                continue
            copy(pdf, f'{subject}/{topic["slug"]}/pdf/{pdf.name}')
            pdfs.append(
                f'  <li><a class="tile" href="pdf/{esc(pdf.name)}"><span class="tile-text">'
                f'<span class="kind">{esc(t["kinds"][kind])}</span>{esc(item["title"])}</span>'
                f'{draft_tag(subject, item)}<span class="tag">PDF</span></a></li>')
            key = pdf.with_name(f'{item["slug"]}-answers.pdf')
            if key.exists():
                copy(key, f'{subject}/{topic["slug"]}/pdf/{key.name}')
                answers.append(
                    f'  <li><a class="tile" href="pdf/{esc(key.name)}"><span class="tile-text">'
                    f'<span class="kind">{esc(t["answers"])}</span>{esc(item["title"])}</span>'
                    f'<span class="tag">PDF</span></a></li>')
            elif item.get("answers"):
                warnings.append(f"{key.relative_to(ROOT)} is missing, not listed")
        else:
            warnings.append(f"{subject}/{topic['slug']}: unknown item kind {kind!r}, skipped")

    parts = [f'<h1>{esc(topic["title"])}</h1>']
    if lessons:
        parts.append(f'<h2>{esc(t["activities"])}</h2>\n<ul class="list">\n' + "\n".join(lessons) + "\n</ul>")
    if pdfs:
        parts.append(f'<h2>{esc(t["pdfs"])}</h2>\n<ul class="list">\n' + "\n".join(pdfs) + "\n</ul>")
    if not lessons and not pdfs:
        parts.append(f'<p class="empty">{esc(t["empty"])}</p>')
    if answers:
        parts.append(f'<section class="parents">\n<h2>{esc(t["parents"])}</h2>\n<ul class="list">\n'
                     + "\n".join(answers) + "\n</ul>\n</section>")
    page(f'{subject}/{topic["slug"]}/index.html', lang=t["lang"],
         title=f'{topic["title"]} · {APP_NAME}', body_class=f"subject-page-{subject}",
         nav=back("../", t["title"]), content="\n".join(parts))


def build_static() -> None:
    copy(SHARED / "style.css", "style.css")
    copy(SHARED / "app.js", "app.js")
    for png in sorted((SHARED / "icons").glob("icon-*.png")):
        copy(png, f"icons/{png.name}")
    write("robots.txt", "User-agent: *\nDisallow: /\n")
    write(".nojekyll", "")
    manifest = {
        "name": APP_NAME, "short_name": APP_NAME, "lang": "tr",
        "start_url": "./", "scope": "./", "display": "standalone",
        "background_color": BG, "theme_color": BG,
        "icons": [
            {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
        ],
    }
    write("manifest.webmanifest", json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    page("404.html", lang="tr", title=APP_NAME, nav=back("./", "Ana sayfa"),
         content="<h1>Bu sayfa bulunamadı</h1>\n<p>Ana sayfaya dön ve tekrar dene.</p>")


def build_service_worker() -> None:
    """Offline support: every page, style, script and icon is saved on the iPad on the first visit.
    PDFs are saved the first time each one is opened. A new version replaces the old copy."""
    urls, digest = ["./"], hashlib.sha256()
    for rel in sorted(written):
        if rel.endswith(".pdf") or rel in (".nojekyll", "404.html"):
            continue
        digest.update(rel.encode() + b"\0" + (OUT / rel).read_bytes())
        urls.append("./" + rel)
        if rel.endswith("/index.html"):
            urls.append("./" + rel[: -len("index.html")])
    version = digest.hexdigest()[:12]
    sw = f"""// Made by tools/build.py: do not edit.
const CACHE = 'site-{version}';
const FILES = {json.dumps(sorted(set(urls)), indent=2)};

self.addEventListener('install', (event) => {{
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
}});

self.addEventListener('activate', (event) => {{
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
}});

self.addEventListener('fetch', (event) => {{
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async (cache) => {{
    const hit = await cache.match(req, {{ ignoreSearch: true }});
    if (hit) return hit;
    try {{
      const res = await fetch(req);
      if (res.ok && !res.redirected) cache.put(req, res.clone());
      return res;
    }} catch (err) {{
      return (await cache.match('./')) || Response.error();
    }}
  }}));
}});
"""
    write("sw.js", sw)


def main() -> int:
    global OUT, INCLUDE_DRAFTS
    if "--preview" in sys.argv:
        OUT, INCLUDE_DRAFTS = PREVIEW, True
    if OUT.parent.resolve() != ROOT.resolve() or OUT.name not in ("site", "_preview"):
        print("Refusing to clean an unexpected folder.")
        return 1
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    build_static()
    build_home()
    for subject in SUBJECTS:
        build_subject(subject)
    build_service_worker()
    for w in warnings:
        print("WARNING:", w)
    if left_out:
        print(f"Left out {len(left_out)} draft(s): " + ", ".join(left_out))
    where = "_preview/ (private preview, drafts included)" if INCLUDE_DRAFTS else "site/ (public website)"
    print(f"Built {len(written)} files into {where}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
