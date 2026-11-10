# Project memory (for Claude)

Learning material for a Grade 3 child: **Math** and **English**.
This file is committed to a **public** GitHub repository: it must never contain personal details,
local folder paths, or names of the owner's businesses or other projects.
Private rules live in `CLAUDE.local.md` (not in Git): **read it at the start of every session** if it exists.

## Who I work with
- The parent is not a developer. Explain every step in plain words and say exactly what to click.
- The parent has expert English (grammar, writing, pronunciation), teaches her English himself, and
  creates and manages her worksheets. Discuss English content with him at that level; he decides
  the content and Claude builds it. Materials can include short parent notes (how to use the sheet,
  what to listen for when she reads aloud).
- Claude runs Git (commit, push). Never ask the parent to type Git commands.
- Never download or install anything without asking first (say what, from where, and how big).
- Whenever something important is decided, update this file and tell the parent.

## What we make
1. **Interactive lessons**: plain HTML pages, no frameworks, no 3D. For an iPad in Safari: large,
   touch-friendly, tap and drag, simple visuals, instant "Well done!" / "Try again" feedback,
   **one activity per page**.
2. **Printable PDF worksheets** with a **separate answer key**, made from the same lesson content,
   printed with Google Chrome in headless mode (already installed on the Mac; nothing to install).
3. **A home page** with big Math and English buttons that lists every lesson.
4. **Stand-alone PDFs** (not tied to an interactive lesson), always print-quality and colourful:
   - personalised **revision sheets and homework** based on what she is studying at school;
   - **1-2 page visual explainers** (e.g. shapes, fractions) that teach with colour and diagrams;
   - **short stories** (1-2 pages) in English, optionally with Turkish translations or a glossary of
     key words.
   A PDF cannot run activities on an iPad; real interactivity (tap, drag, feedback) belongs in the
   HTML lessons. A PDF can still be visual, colourful and clickable within itself.

## The learner (general; private details are in CLAUDE.local.md)
- **English** is a foreign language for her: good with single words, needs help **building sentences**
  (word order, short sentences, reading short texts). Keep English simple; Turkish support words help.
- **Math**: the goal is **understanding and visualising** concepts, not only computing.
- Some work is on the **iPad**, some on **paper**.
- Lessons and sheets follow her school's Grade 3 curriculum, from documents in `curriculum/`
  (git-ignored: school documents are never published).
- Text must display Turkish letters correctly (ç ğ ı İ ö ş ü).

## How it is delivered (decided)
- Static website on **GitHub Pages** from a **public** repository (free).
- On the iPad: Safari, then Share > Add to Home Screen, so it opens like an app.
- **Works offline** after the first visit: a service worker plus a web app manifest (https only).
- Search engines are asked not to index it: `robots.txt` (Disallow all) and
  `<meta name="robots" content="noindex, nofollow">` on every page.

## Safety rules (always, checked by `tools/check.py` before every publish)
- No personal information anywhere: no name, photo, school, city or birthday of the child, in pages,
  file names, or metadata (including PDF metadata).
- No outside links. No third-party scripts, fonts, CDNs, ads, tracking, or forms that send data.
  Everything is inside the site and works offline.
- No local folder paths and none of the private words listed in `tools/private-words.txt` (not in Git)
  in any page, PDF, or PDF metadata.
- No password, token, or secret in any file.

## Folders
| Folder | What it holds |
|---|---|
| `CLAUDE.md` | This project memory (public, keep it clean). |
| `CLAUDE.local.md` | Private notes and rules (git-ignored). |
| `START-HERE.md` | Short map of the folders for the parent. |
| `_shared/` | Page template, shared CSS and JS, fonts (open licence only). |
| `math/`, `english/` | Lesson sources, one folder per topic (e.g. `math/multiplication-arrays/`). |
| `tools/` | Build, check, PDF and publish scripts (Python 3, standard library only; no Node on this Mac). |
| `site/` | Built website that is published. **Never edit by hand.** |
| `worksheets/` | Built PDFs: worksheets, answer keys, revision sheets, explainers, stories. **Never edit by hand.** |
| `curriculum/` | School curriculum and her school documents, shared by the parent. **Private, git-ignored.** |

## Decisions
- **Math is 100% Turkish** for now: all text, buttons, feedback ("Aferin!", "Tekrar dene"), PDF titles.
  Pages use `lang="tr"` (so capital letters of i/ı come out right: i → İ, ı → I).
- **English** pages and sheets are in English; Turkish support words only where the parent wants them.
  **American spelling and American pronunciation** (until the parent changes it). Pages use `lang="en-US"`.
- **Tap to hear (English)**: words and sentences in English lessons can be read aloud when tapped,
  using the iPad's own built-in voices (Web Speech API `speechSynthesis`, voice `en-US`).
  No recordings, no outside service, nothing downloaded. The parent remains her main pronunciation model.
- **Font**: Avenir Next, built into both the iPad and the Mac, so pages and PDFs look the same and
  nothing is downloaded. Fallback: the system font. Can be changed later in `_shared/` only.
- **PDFs are also on the website**, organised by subject and topic, mirroring the iMac folders.
  **Answer keys are on both the iMac and the website**; on each topic page they are listed in a
  separate "For parents" section at the bottom ("Veli için" on math pages), not next to the worksheets.
- **File and folder names**: lower-case ASCII, words joined by `-`, numbered in curriculum order
  (e.g. `01-dogal-sayilar`). No Turkish letters or spaces in names (they break web addresses);
  the real Turkish titles are shown on the pages.

## How everything is organised (same on the iMac and the website)
Subject, then topic (numbered in the school's order), then the material for that topic.
```
math/03-toplama-islemi/            <- source (what Claude writes)
  topic.json                       <- Turkish title, order, list of items
  lesson-01-onluk-bozma/           <- one interactive activity
  worksheet-01-…/  revision-01-…/  explainer-01-…/   (English also: story-01-…/)
site/math/03-toplama-islemi/       <- built website (never edit by hand)
  index.html                       <- topic page: activities and PDFs, listed by kind
  lesson-01-onluk-bozma/index.html <- the activity (plus its lesson.css / lesson.js)
  pdf/worksheet-01-….pdf
worksheets/math/03-toplama-islemi/ <- built PDFs on the iMac (same names)
  worksheet-01-….pdf   worksheet-01-…-answers.pdf
```
- Home page: two big buttons, **Matematik** and **English**. Each opens the subject page, which lists
  the topics in order; each topic page lists its activities first, then its PDFs.
- PDF kinds: `worksheet` (practice + answer key), `revision` (revision sheet / homework),
  `explainer` (1-2 page visual explanation), `story` (English short story).

## Tools (run from the project folder; Python 3 standard library only)
- `python3 tools/build.py`: rebuilds `site/` from `_shared/`, `math/`, `english/`, `worksheets/`.
  A topic is a folder with `topic.json` (`title`, `items` of `{kind, slug, title, answers?}`);
  a lesson is `<topic>/<lesson-slug>/lesson.html` (page content only; the template adds the rest),
  with optional `lesson.css`, `lesson.js` and assets. Also writes `sw.js` (offline cache, versioned
  by content), `manifest.webmanifest`, `robots.txt`, `404.html`, `.nojekyll`.
- `python3 tools/check.py`: the safety check (see Safety rules). Also scans every file going to GitHub.
  Proven to catch a planted private word, outside link and form.
- `python3 tools/make_icons.py`: makes `_shared/icons/*.png` from `_shared/icon.svg` with headless Chrome.
- `python3 tools/publish.py "message"`: build, check, commit, push. Stops at the first problem and
  refuses to commit unless Git uses the noreply email.
- Preview drafts: `.claude/launch.json` config `site-preview` serves `site/` on http://localhost:8765
  (the service worker only runs on https, so previews are never stale).
- Page rules: no inline scripts or `on…=` handlers (the content security policy blocks them);
  put code in `lesson.js`. Tap to hear: any element with `data-say` is read aloud (`_shared/app.js`).
- Publishing on GitHub: `.github/workflows/pages.yml` runs `tools/check.py --ci` and then publishes
  `site/` with GitHub Pages (Source: GitHub Actions) on every push to `main`.
  Later, for cloud sessions: add a repository secret `PRIVATE_WORDS` so the check on GitHub also
  knows the private words (until then it warns and checks everything else).

## How we work
- One lesson at a time. Before building it, explain in plain words what it will do, and ask what is
  needed (her level, what she finds hard, which curriculum).
- Interactive HTML first: show a **draft**, the parent approves, **only then** publish.
- Publishing after approval is automatic: build, run the check, commit, push.
- The parent uses **two conversations** in this folder, one for Math and one for English.
  Shared parts (`_shared/`, `tools/`, `CLAUDE.md`) are changed in **only one conversation at a time**.
  Before changing them, say so; if the other conversation might be changing them, ask first.

## Git and GitHub
- The Git repository is **only this folder**. Nothing from the parent folder ever goes to GitHub.
- Neutral Git identity, set for this repository only (`git config`, never `--global`):
  a neutral name and the GitHub "noreply" email.
- Push over SSH with a key created on the Mac for this repository only (GitHub "deploy key" with write
  access, used via the repository's `core.sshCommand`). The private key stays in the Mac's SSH folder:
  `~/.ssh/lessons_deploy_ed25519` (label `lessons-deploy-key`, no passphrase; it can reach only this
  one repository). Git was initialised in this folder on branch `main`.
- GitHub account: `ogrenmek-guzel` ("learning is beautiful"). Git identity for this repo:
  name `ogrenmek-guzel`, email `354928007+ogrenmek-guzel@users.noreply.github.com`.
- Repository: `ogrenmek-guzel/ogrenmek-guzel.github.io` (public), remote `origin` over SSH.
  Website address: **https://ogrenmek-guzel.github.io/** (short address, no sub-folder).

## Status
- [x] Folders, CLAUDE.md, START-HERE.md created.
- [x] Learner background received (school language Turkish, English learner, visual math).
- [x] Decided: math 100% Turkish; font Avenir Next; PDFs on the website, organised like the iMac.
- [x] Decided: American spelling and pronunciation; tap-to-hear in English; answer keys on iMac and website.
- [ ] Waiting for: curriculum documents in `curriculum/`.
- [x] GitHub account, repository and deploy key set up; connection tested.
- [x] Template, home page, icons, build, check and publish scripts (PDF script still to come).
- [ ] GitHub Pages switched to "GitHub Actions" and first version pushed.
- [ ] First lesson.
