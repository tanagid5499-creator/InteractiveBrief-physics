# Agent Notes

## Start Here

Read these files in order:

1. `CLAUDE.md`
2. `HANDOFF.md`
3. `NEXT_STEPS.md`

Run `python verify_project.py` before and after meaningful edits.

## Project Shape

- Static HTML/CSS/JavaScript only
- 19 standalone lab briefs
- Shared layer:
  - `shared/drafting-sheet.css`
  - `shared/brief-core.js`
- Shared cache version is currently `?v=7`
- Local server: `python serve.py`
- Root launcher: `http://127.0.0.1:8000/`

## Guardrails

- Preserve all 19 lab paths and root links.
- Keep Thai instructional content intact.
- Keep experiment-specific code inside each lab.
- Keep shared behavior and presentation inside `shared/`.
- If shared CSS or JS changes, bump its cache version in all 19 pages.
- Do not expose clicker answers to students.
- Keep participation anonymous and allow re-voting until close.
- Use local WebP equipment photos; do not hotlink.
- Do not overwrite unrelated worktree changes.

## Current Priority

Implement Clicker Phase 2A in `NEXT_STEPS.md`: create a local registry for all
62 `261111` Bloom questions and add teacher-side course/lab selection. Supabase
work is blocked on owner-provided credentials and deployment decisions.
