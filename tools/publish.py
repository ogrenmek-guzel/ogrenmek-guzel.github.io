#!/usr/bin/env python3
"""Publish: build the website, run the safety check, save a version in Git and upload it to GitHub.

Run:  python3 tools/publish.py "Short description of what changed"
      python3 tools/publish.py --dry-run "..."   shows what would be uploaded, changes nothing

Drafts (items or topics with "draft": true in topic.json) are never published: the website leaves
them out, and their files stay on the iMac only, so publishing from one chat can never send the
other chat's unapproved work online.
Stops at the first problem. GitHub then puts the website online in about a minute.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NEUTRAL_EMAIL_END = "@users.noreply.github.com"
SUBJECTS = ("math", "english")


def run(*cmd: str, capture: bool = False) -> str:
    result = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=capture)
    if result.returncode != 0:
        if capture:
            print(result.stdout, result.stderr)
        raise SystemExit(f"STOPPED: '{' '.join(cmd)}' failed.")
    return result.stdout if capture else ""


def draft_paths() -> list[Path]:
    """Files and folders that belong to drafts: kept out of Git until the draft mark is removed."""
    paths: list[Path] = []
    for subject in SUBJECTS:
        for meta in sorted((ROOT / subject).glob("*/topic.json")):
            data = json.loads(meta.read_text(encoding="utf-8"))
            topic = meta.parent
            pdf_dir = ROOT / "worksheets" / subject / topic.name
            if data.get("draft"):
                paths += [topic, pdf_dir]
                continue
            for item in data.get("items", []):
                if item.get("draft"):
                    slug = item["slug"]
                    paths += [topic / slug, pdf_dir / f"{slug}.pdf", pdf_dir / f"{slug}-answers.pdf"]
    return [p for p in paths if p.exists()]


def main() -> int:
    args = [a for a in sys.argv[1:] if a != "--dry-run"]
    dry = "--dry-run" in sys.argv
    if not args or not args[0].strip():
        print('Usage: python3 tools/publish.py [--dry-run] "what changed"')
        return 1
    message = args[0].strip()

    email = run("git", "config", "user.email", capture=True).strip()
    if not email.endswith(NEUTRAL_EMAIL_END):
        raise SystemExit("STOPPED: Git is not using the neutral noreply email for this folder.")

    print("1/4 Building the website...")
    run(sys.executable, "tools/build.py")
    print("2/4 Running the safety check...")
    run(sys.executable, "tools/check.py")

    drafts = draft_paths()
    tracked_drafts = [p for p in drafts
                      if run("git", "ls-files", "--", str(p.relative_to(ROOT)), capture=True).strip()]
    if tracked_drafts:
        print("NOTE: these drafts were published before, so changes to them will be uploaded:")
        for p in tracked_drafts:
            print("   ", p.relative_to(ROOT))
    excludes = [f":(exclude){p.relative_to(ROOT).as_posix()}" for p in drafts]
    if drafts:
        print(f"Keeping {len(drafts)} draft file(s)/folder(s) on the iMac only:")
        for p in drafts:
            print("   ", p.relative_to(ROOT))

    if dry:
        print("DRY RUN: these changes would be uploaded:")
        out = run("git", "add", "-A", "--dry-run", "--", ".", *excludes, capture=True)
        print(out.strip() or "   (nothing)")
        return 0

    print("3/4 Saving a version...")
    run("git", "add", "-A", "--", ".", *excludes)
    if subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=ROOT).returncode == 0:
        print("Nothing changed: nothing to publish.")
        return 0
    run("git", "commit", "-q", "-m", message)

    print("4/4 Uploading to GitHub...")
    run("git", "push", "-u", "origin", "main")
    print("Done. The website updates in about a minute.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
