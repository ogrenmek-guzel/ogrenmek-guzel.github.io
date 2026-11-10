#!/usr/bin/env python3
"""Publish: build the website, run the safety check, save a version in Git and upload it to GitHub.

Run:  python3 tools/publish.py "Short description of what changed"
Stops at the first problem. GitHub then puts the website online in about a minute.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NEUTRAL_EMAIL_END = "@users.noreply.github.com"


def run(*cmd: str, capture: bool = False) -> str:
    result = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=capture)
    if result.returncode != 0:
        if capture:
            print(result.stdout, result.stderr)
        raise SystemExit(f"STOPPED: '{' '.join(cmd)}' failed.")
    return result.stdout if capture else ""


def main() -> int:
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        print('Usage: python3 tools/publish.py "what changed"')
        return 1
    message = sys.argv[1].strip()

    email = run("git", "config", "user.email", capture=True).strip()
    if not email.endswith(NEUTRAL_EMAIL_END):
        raise SystemExit("STOPPED: Git is not using the neutral noreply email for this folder.")

    print("1/4 Building the website...")
    run(sys.executable, "tools/build.py")
    print("2/4 Running the safety check...")
    run(sys.executable, "tools/check.py")

    print("3/4 Saving a version...")
    run("git", "add", "-A")
    if not run("git", "status", "--porcelain", capture=True).strip():
        print("Nothing changed: nothing to publish.")
        return 0
    run("git", "commit", "-q", "-m", message)

    print("4/4 Uploading to GitHub...")
    run("git", "push", "-u", "origin", "main")
    print("Done. The website updates in about a minute.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
