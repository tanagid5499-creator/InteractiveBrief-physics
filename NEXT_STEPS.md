# Next Steps

Ordered work queue for the next developer.

## 1. Clicker Phase 2A - Complete Local Question Registry

This is the recommended next task because it is fully actionable without
external credentials.

### Scope

- Extract all 62 Bloom questions from the 10 `261111` lab pages into a
  structured clicker registry.
- Organize the registry by course and lab, not as one hardcoded Lab 01 array.
- Add course/lab selection to `clicker/host.html`.
- Keep `BroadcastChannel` as the local demo transport.
- Keep responder choices dynamic and compatible with A-E.
- Keep anonymous voting and reset-session behavior.
- Allow re-voting while a question is open.
- Stop accepting votes after the teacher closes the question.
- Never reveal or highlight the correct answer on the student screen.

### Suggested Shape

```javascript
window.CLICKER_COURSES = {
  "261111": {
    title: "ปฏิบัติการฟิสิกส์ 1",
    labs: {
      "lab01": {
        title: "...",
        questions: [
          {
            id: "lab01-q01",
            bloom: "Remember",
            prompt: "...",
            options: { A: "...", B: "...", C: "...", D: "...", E: "..." }
          }
        ]
      }
    }
  }
};
```

Keep teacher-only answer data separate from the payload rendered by
`respond.html`.

### Acceptance Criteria

- The teacher can select any `261111` lab and any of its Bloom questions.
- The registry contains exactly 62 unique question IDs.
- Lab 01 contains 8 questions; Labs 02-10 contain 6 each.
- All questions contain choices A-E.
- Opening, closing, re-voting, tallying, and resetting still work locally.
- The student page contains no correct-answer indication.
- `python verify_project.py` passes.
- Changed clicker pages are visually checked at desktop and mobile widths.

## 2. Clicker Phase 2B - Production Transport

Replace or wrap the local `BroadcastChannel` transport with Supabase Realtime
after the owner provides:

- Supabase project URL
- Supabase anonymous key
- Teacher authentication strategy and test account
- Deployment target and public domain
- Expected maximum concurrent students
- Session retention/privacy policy

Required behavior:

- Teacher creates or resets a named session.
- Students join with a session code or QR URL.
- Votes remain anonymous.
- One active vote per browser participant per question.
- Re-voting replaces the previous vote until close.
- Late votes are rejected after close.
- Correct answers are never sent to the student client.
- Teacher state survives a page refresh where practical.

Do not commit real secrets. Use documented local configuration or environment
variables and provide an example file.

## 3. Replace Six Remaining Equipment Placeholders

| Lab | Card | Missing image |
|---|---:|---|
| 04 | 4 | screen |
| 06 | 6 | paper towel |
| 07 | 4 | Atwood machine |
| 07 | 5 | stopwatch |
| 08 | 6 | stopwatch + scale |
| 10 | 4 | stopwatch |

Only replace these when matching source images are supplied or clearly located.
Use 1200x675 WebP files and preserve meaningful Thai `alt` text.

## 4. Phase 1 for Physics Laboratory II

Apply the completed Phase 1 pattern to all nine `261112` lab briefs:

- Bloom questions covering all six levels
- Choices A-E
- `data-qid`, `data-bloom`, and `data-answer`
- Local equipment photos where source images exist
- Clicker registry entries after the question set is approved

Treat this as a new content-review phase; do not mechanically invent answers
without checking the experiment content.

## 5. Lower Priority

- Add an appendix linked from the relevant lab briefs.
- Complete production deployment and end-to-end multi-device testing.
- Run accessibility and print-layout review across all 19 briefs.
