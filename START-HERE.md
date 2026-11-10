# Start here

A short map of this project. You never need to edit these files yourself: just ask Claude.

## The folders
- **CLAUDE.md**: Claude's memory for this project. Claude keeps it up to date.
- **START-HERE.md**: this page.
- **_shared/**: the parts every lesson shares (page design, colours, buttons, fonts).
- **math/**: the Math lessons, one folder per topic.
- **english/**: the English lessons, in two separate paths:
  - **english/school/**: School English (her school book);
  - **english/private/**: Private Lessons (her private lesson books).
- **tools/**: the scripts Claude runs to build, check, print and publish.
- **site/**: the finished website that goes online. Built automatically: never edit it by hand.
- **worksheets/**: the finished printable PDFs (worksheets, answer keys, revision sheets, explainers,
  stories). Built automatically.
- **curriculum/**: put her books and documents here (photos, PDFs, scans), in the right sub-folder:
  `curriculum/math/`, `curriculum/english/school/` or `curriculum/english/private/`.
  This folder is **private**: it never goes to GitHub.

## How things are organised
Everything is sorted the same way on the iMac and on the website:
**subject → topic (numbered in school order) → the material for that topic.**

Example, on the iMac:
- `worksheets/math/03-toplama-islemi/worksheet-01-....pdf` (the worksheet)
- `worksheets/math/03-toplama-islemi/worksheet-01-...-answers.pdf` (its answer key)

On the website, she taps **Matematik**, then the topic, and sees the activities first and the PDFs below.
Names use plain letters without Turkish characters (they would break web addresses); the real
Turkish titles appear on the pages themselves.

## How a lesson is made
1. You ask for a lesson (in the Math conversation or the English conversation).
2. Claude explains what it will do and asks questions.
3. Claude shows you a draft, marked **TASLAK** (Math) or **DRAFT** (English). Drafts stay on the
   iMac only: they never go online, even when the other chat publishes something.
4. You say "approved". Claude removes the draft mark, checks it for safety, and publishes it.
5. On the iPad, the new lesson appears on the home page.

## Two conversations
Use one conversation for Math and one for English, both in this folder.
Only one of them should change the shared parts (design, scripts, CLAUDE.md) at a time.

## Working from your phone
- **Remote Control**: lets you continue a conversation from the Claude app on your phone while the
  iMac is **on, awake, and the Claude app is open**. Ask Claude to switch it on for a conversation.
- **Cloud sessions**: on claude.ai/code (or the Code section of the Claude phone app) you can start a
  conversation on the GitHub repository that runs on Anthropic's computers, so the iMac can be off.
  It works on a copy of the project and saves its work on a separate branch for you to approve.
  Building PDF worksheets may still need the iMac.
