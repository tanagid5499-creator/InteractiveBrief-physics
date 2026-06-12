# CLAUDE.md

Entry point for continuing this project in Claude Code.

## Read First

1. Read `HANDOFF.md` for project history, constraints, and current status.
2. Read `NEXT_STEPS.md` for the ordered work queue and acceptance criteria.
3. Run `python verify_project.py` before editing.
4. Start the local site with `python serve.py`.
5. Open `http://127.0.0.1:8000/`.

## Project

Interactive laboratory briefs for:

- `261111` Physics Laboratory I: 10 lab briefs
- `261112` Physics Laboratory II: 9 lab briefs

The implementation is static HTML/CSS/JavaScript. There is no npm project,
framework, or build step.

## Current Status

- All 19 lab briefs are present and structurally complete.
- All 10 `261111` briefs have Phase 1 Bloom clicker questions.
- `261111` contains 62 Bloom questions: Lab 01 has 8; Labs 02-10 have 6 each.
- Every `261111` lab covers all six Bloom levels and uses choices A-E.
- The clicker demo currently runs Lab 01 locally with `BroadcastChannel`.
- 52 of 58 `261111` equipment cards use local WebP photos.
- Six cards still use SVG placeholders because no matching photo exists.
- Shared assets currently use cache version `?v=7`.

Run `python verify_project.py` to confirm these baselines.

## Key Files

- `index.html` - course and lab launcher
- `HANDOFF.md` - authoritative project context
- `NEXT_STEPS.md` - ordered implementation queue
- `verify_project.py` - zero-dependency structural verifier
- `serve.py` - local static server with WebP MIME support
- `shared/drafting-sheet.css` - shared visual layer
- `shared/brief-core.js` - shared navigation and interaction behavior
- `clicker/host.html` - teacher clicker view
- `clicker/respond.html` - student clicker view
- `clicker/questions.js` - current Lab 01 clicker question data
- `.claude/launch.json` - Claude Code local preview configuration

Each lab lives at:

```text
<course>-lab-XX-<slug>/
  interactive-lab/
    index.html
    styles.css
    js/app.js
    assets/
```

## Non-Negotiable Constraints

- Keep the project dependency-free unless the owner approves a toolchain change.
- Preserve all 19 lab paths and the root launcher links.
- Do not remove or shorten existing Thai instructional content.
- Keep each lab usable as a standalone page.
- Keep shared behavior in `shared/`; keep experiment-specific simulations in
  each lab's `interactive-lab/js/app.js`.
- Student-facing clicker screens must not reveal the correct answer.
- Clicker participation remains anonymous.
- Students may change their vote until the teacher closes the question.
- Equipment photos must stay local; do not hotlink external images.
- Do not overwrite unrelated edits in a dirty worktree.

## Editing Rules

- Read the target file and one neighboring lab before changing shared patterns.
- Use established class names and DOM conventions.
- When changing shared CSS or JS, update the query-string cache version in all
  19 lab HTML files.
- Keep photo assets under `interactive-lab/assets/equip/equip-NN.webp`.
- Preserve `data-qid`, `data-bloom`, and `data-answer` on Bloom question cards.
- Keep quiz options exactly A-E for the completed `261111` Bloom set.

## Source Images

The equipment-photo source folder is normally a sibling of this repository:

```text
..\ภาพอุปกรณ์การทดลอง\
```

It contains the course folders `261111`, `261112`, and shared reference images.
Old owner-specific PDF paths are not portable and are not required for the
current implementation.

## Verification

After edits:

```powershell
python verify_project.py
python serve.py
```

For an HTTP smoke test:

```powershell
@'
from urllib.request import urlopen
for url in [
    "http://127.0.0.1:8000/",
    "http://127.0.0.1:8000/261111-lab-01-measurement/interactive-lab/",
    "http://127.0.0.1:8000/clicker/host.html",
    "http://127.0.0.1:8000/clicker/respond.html",
]:
    with urlopen(url) as response:
        print(response.status, response.headers.get_content_type(), url)
'@ | python -
```

Also inspect changed pages in a browser at desktop and mobile widths.

## Recommended Next Task

Start with **Clicker Phase 2A** from `NEXT_STEPS.md`: expand the local clicker
from hardcoded Lab 01 data into a registry covering all 62 `261111` questions,
with course/lab selection on the teacher page.

Do not begin Supabase production transport until the owner supplies the
credentials and deployment decisions listed under Phase 2B.
