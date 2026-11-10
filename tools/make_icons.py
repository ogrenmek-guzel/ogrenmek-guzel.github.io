#!/usr/bin/env python3
"""Make the app icons (PNG) from _shared/icon.svg using Google Chrome in headless mode.

Run:  python3 tools/make_icons.py
Only needed when _shared/icon.svg changes. Output: _shared/icons/icon-180.png, -192.png, -512.png.
"""
from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SVG = ROOT / "_shared" / "icon.svg"
OUT = ROOT / "_shared" / "icons"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SIZES = (180, 192, 512)


def main() -> int:
    if not Path(CHROME).exists():
        print("Google Chrome was not found in Applications.")
        return 1
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = Path(tmp)
        shutil.copy(SVG, tmpdir / "icon.svg")
        for size in SIZES:
            page = tmpdir / f"icon-{size}.html"
            page.write_text(
                f'<!doctype html><html><body style="margin:0;overflow:hidden">'
                f'<img src="icon.svg" width="{size}" height="{size}" style="display:block"></body></html>',
                encoding="utf-8")
            png = tmpdir / f"icon-{size}.png"
            subprocess.run(
                [CHROME, "--headless", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
                 "--no-default-browser-check", f"--user-data-dir={tmpdir / 'profile'}",
                 f"--window-size={size},{size}", f"--screenshot={png}", page.as_uri()],
                check=True, capture_output=True, timeout=60)
            shutil.copy(png, OUT / png.name)
            print("Made", (OUT / png.name).relative_to(ROOT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
