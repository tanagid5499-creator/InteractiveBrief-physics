# Interactive Briefing Guidelines

Use this file before creating or revising any lab inside `*/interactive-lab/`.
The goal is a consistent student-facing interactive briefing presentation across
all 19 physics labs.

## Core Purpose

Each lab page is an interactive briefing presentation for students. It should
help students understand the experiment before and during the lab, make small
decisions, avoid common mistakes, and prepare a better written report.

Every lab should begin by helping students appreciate why this experiment is
worth doing. The opening should connect the lab to the philosophy of
experimental physics: nature does not hand us equations directly; we build
evidence through instruments, uncertainty, models, judgment, and repeated
measurement.

The page is not:

- an instruction manual
- a teacher script
- a scanned or reformatted Word document
- a print/export portal
- a dashboard with unrelated controls

## Required Presentation Flow

Use only sections that support the student briefing. A typical lab should use:

1. `แรงจูงใจ`
   - why this lab is worth doing
   - the puzzle, discrepant event, or motivating question
   - how the lab illustrates the philosophy of experimental physics
   - how students will move from observation to evidence, explanation, and judgment

2. `ภาพรวม`
   - Lab title
   - objectives
   - what students will observe, measure, or compare

3. `แนวคิดพื้นฐาน`
   - core concepts and theory
   - formulas rendered with KaTeX
   - interpretation of variables and units
   - links between theory and the measured quantities

4. `เครื่องมือ / ชุดทดลอง`
   - apparatus or circuit/setup overview
   - clean diagrams, reconstructed visuals, or readable source images
   - what each component does
   - what students must check before using it

5. `แบบฝึก / กิจกรรมโต้ตอบ`
   - simulator, reading practice, graph practice, setup practice, or prediction activity
   - short quizzes at moments where a misconception is likely
   - immediate feedback for student choices

6. `ตารางผลการทดลอง`
   - data entry and derived calculations where useful
   - student-facing cautions before values are recorded
   - guided prompts for calculations, interpretation, conclusion, and further research

Only add another section if the lab genuinely needs a separate conceptual or
interactive stage. Keep the left navigation short and presentation-like.

## Motivation Step

Place `แรงจูงใจ` before `ภาพรวม` in both the left navigation and the document
flow. This is the intellectual doorway into the lab. It should be concise,
student-facing, and specific to the experiment.

Adapt the 5E learning cycle to the lab briefing:

1. Engage
   - Spark curiosity with a puzzling question, surprising observation,
     discrepant event, or miniature demonstration.
   - Connect to prior knowledge students already have.
   - Example framing: "Why do repeated measurements disagree even when nobody
     made an obvious mistake?"

2. Explore
   - Give students a first interactive action before formal explanation.
   - Let them make a prediction, adjust a simulator, compare two readings,
     inspect a setup, or discuss what they expect to happen.
   - Avoid giving the full answer immediately.

3. Explain
   - Introduce the formal vocabulary, formula, model, or measurement principle
     after the exploratory prompt.
   - Show how the lab turns raw observation into evidence.

4. Elaborate
   - Connect the lab to a new context, real instrument, real-world measurement,
     research practice, or follow-up experiment.
   - Ask students how they would extend or improve the measurement.

5. Evaluate
   - Include a small check of understanding, reflection prompt, or claim-evidence
     question.
   - This can be a quick quiz, prediction check, short written response, or
     peer discussion prompt.

The motivation section should not become a long lecture. It should fit on one
presentation screen when possible and create a reason to care before students
see the formal objectives.

## Avoid These Sections And Components

Do not include these as visible presentation sections:

- `ขั้นตอนการบรีฟ`
- `คู่มือฉบับเต็ม`
- `พิมพ์ / ส่งออก`
- `หมายเหตุสำหรับผู้สอน`

Do not include:

- top toolbar
- light/dark mode toggle
- print/export/import JSON controls
- teacher-only notes in the student page
- generic manual-style procedural lists unless they are transformed into student-facing interactions

## Visual Style

Follow the Lab 01 prototype style:

- light-only Nord color scheme
- fixed left navigation
- centered article panel with soft rounded card styling
- right teaching rail for formulas, glossary, cautions, equipment, and presentation controls
- no top toolbar
- no dark mode
- uniform section heading size
- clean, calm, polished educational-product feel
- avoid decorative landing-page or infographic treatment

The layout should feel like a live briefing surface. It should not feel like a
manual page, admin dashboard, or worksheet-only tool.

## Language And Tone

- Main language is Thai.
- Use English only for useful technical terms, such as `resolution`,
  `precision`, `accuracy`, `zero error`, or standard physics notation.
- Speak directly to students.
- Use wording like: "ลองตอบ", "ก่อนบันทึกค่า", "ระวังระหว่างวัด",
  "ควรเขียนให้เห็น", "แนวทางเขียนสรุป".
- Do not write teacher-facing directions such as "ผู้สอนควร..." or
  "เปิดด้วยคำถาม...".

The intended tone is:

> Here is what you are seeing. Try this. Watch out for this mistake. Now explain
> your result with evidence.

## Content Transformation Rules

Preserve the source lab's substantive content, but transform it into briefing
content rather than reproducing the source document.

For each lab, extract and represent:

- motivation hook and experimental-physics philosophy
- objectives
- core theory and formulas
- variables and units
- equipment or setup
- measurement method
- common mistakes and safety/handling cautions
- result tables and derived quantities
- conclusion and discussion prompts
- further research prompts

Use KaTeX for all formulas. Avoid raw TeX placeholders in the final page.

Use source images only if they are readable. Replace weak figures with clean
diagrams, canvas visuals, simulations, or reconstructed teaching visuals.

## Interaction Criteria

Each lab should include interaction where it improves understanding:

- presentation/reveal mode
- previous/next presentation point controls
- at least one student-facing interaction when the lab concept supports it
- short quizzes at appropriate misconception points
- immediate feedback for quiz choices
- local worksheet calculations when the lab uses repeated measurements or derived values
- localStorage persistence for student-entered worksheet data

Examples of appropriate interactions:

- scale-reading simulator
- circuit setup selector
- graph prediction/check
- observation classification
- uncertainty or unit conversion quiz
- formula substitution check
- data table with live derived outputs

## Caution Placement

Cautions should appear near the action where mistakes happen, not only in a
generic caution list.

Use student-facing caution blocks such as:

- `ระวังระหว่างวัด`
- `ก่อนบันทึกค่า`
- `ก่อนต่อวงจร`
- `ก่อนอ่านค่า`
- `ก่อนคำนวณ`

Each caution block should include concrete errors students can prevent, such as:

- parallax
- zero error
- wrong unit conversion
- using the wrong diameter/radius
- confusing internal and external dimensions
- inconsistent force/pressure/contact
- circuit polarity or range mistakes
- reading a graph axis incorrectly

## Quiz Rules

Use short quizzes when they sharpen the briefing. Keep them small and targeted.

Each quiz should:

- ask one focused question
- have 2-4 choices
- include one clearly correct answer
- give immediate feedback
- be placed after the relevant concept or simulator

Avoid quizzes that test memorization only. Prefer questions about reading,
prediction, unit choice, formula use, or interpretation.

## Optional Clicker Plan

This section is planning-only. Do not implement the clicker layer unless the user
explicitly asks for clicker implementation.

Future quiz sections may support an optional classroom clicker layer. The normal
on-page quiz buttons must remain usable without any server, so every briefing
continues to work directly from `file://`.

Recommended model:

- Instructor runs the lab briefing on the projector.
- When a quiz appears, the instructor can open a clicker session.
- Students scan a QR code or enter a short local URL on their phones.
- Students answer A / B / C anonymously.
- The briefing page shows live response counts or percentages.
- The instructor reveals the correct answer after responses are collected.

Implementation direction when requested:

- Keep `file://` briefing fully functional without clicker.
- Add clicker mode as an optional local LAN layer using a tiny local server.
- Keep responses temporary and in memory by default.
- No login and no grading unless explicitly requested later.
- One device should submit once per question, with answer changes allowed until
  reveal if practical.
- Instructor controls should include open session, live response bars, reveal
  answer, and reset question.
- Student mobile view should be minimal: lab name, question, A/B/C choices, and
  submit confirmation.

Prototype scope when first implemented:

- Start with only 1-2 quiz questions in Lab 01.
- Verify phone-sized student UI, live counts, reveal answer, and fallback quiz
  behavior.
- Extend to other quizzes only after the first clicker prototype is reviewed.

Acceptance criteria for future clicker implementation:

- briefing still opens directly from `file://`
- clicker is optional, not required
- student page works on phone screens
- instructor can see live counts
- correct answer stays hidden until reveal
- no teacher-script content appears in the student interface
- no top toolbar, no export UI, no dark mode
- quiz content remains student-facing and tied to the lab concept

## Student Writing Support

Do not leave open-ended writing fields without guidance.

For `สรุปและวิจารณ์ผลการทดลอง`, prompts should ask students to:

- report the main numerical results
- compare measured values with expected/theoretical values
- judge which result is most reliable and why
- cite instrument resolution, repeated measurements, or spread in values
- identify one major source of error
- suggest one concrete improvement for a future trial

For `ความรู้ที่ได้ค้นคว้าเพิ่มเติม`, prompts should offer 3-4 relevant research
directions connected to the lab, such as:

- instrument calibration or error correction
- physical meaning of the measured quantity
- real-world applications
- uncertainty propagation
- limits of the model or apparatus
- why a specific technique is used

## Worksheet Criteria

Worksheet blocks should be part of the briefing, not a separate portal.

Each worksheet block should include:

- clear units in table headers or labels
- enough repeated trials for averaging when relevant
- live derived outputs when useful
- before-recording cautions
- prompts for showing calculation steps
- prompts for interpreting the result

Avoid print/export UI. Data persistence can happen silently with localStorage.

## Implementation Criteria

For each lab, create or update files inside that lab's `interactive-lab/` folder.

Preferred static structure:

- `index.html`
- `styles.css`
- `js/app.js`
- supporting JS modules as needed
- `js/app.bundle.js` if the page loads the bundle directly
- local assets under `assets/`

The page must open directly from `file://` without a backend or build server.
If JS modules are bundled, rebuild the bundle after every JS change.

## Verification Checklist

Before reporting completion, verify:

- `แรงจูงใจ` appears before `ภาพรวม` in navigation and document flow
- the motivation section includes adapted Engage, Explore, Explain, Elaborate,
  and Evaluate elements without becoming a teacher script
- no visible `ขั้นตอนการบรีฟ`, `คู่มือฉบับเต็ม`, `พิมพ์ / ส่งออก`, or
  `หมายเหตุสำหรับผู้สอน`
- no light/dark mode toggle
- no top toolbar
- navigation links map only to real visible presentation sections
- section heading sizes are uniform
- KaTeX formulas render from valid source
- quizzes are wired and have answers
- cautions appear next to the relevant action
- writing prompts exist for conclusion and further research fields when those
  fields are present
- worksheet calculations still run after JS edits
- `js/app.bundle.js` is rebuilt when needed
- static syntax checks pass

Use Lab 01, `261111-lab-01-measurement/interactive-lab/`, as the first visual and
content prototype.
