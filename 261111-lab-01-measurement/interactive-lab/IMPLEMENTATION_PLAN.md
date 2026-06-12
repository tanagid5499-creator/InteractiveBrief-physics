# Lab 01 Interactive Briefing Implementation Plan

## Summary

Build this folder as the first complete static professor briefing interface for `261111-lab-01-measurement`. Use `../reference/extracted-content.md` and `../reference/content-audit.md` as the implementation source, preserving all Lab 01 content while correcting documented source issues and converting formulas to KaTeX.

## Key Changes

- Create a no-build static app with `index.html`, `styles.css`, and ES module JavaScript under `js/`.
- Use a Thai-first professor briefing manual layout: fixed left navigation, sticky presenter toolbar, centered article content, right teaching rail, bottom previous/next controls, and responsive mobile collapse.
- Render all formulas with KaTeX, including mean, percent error, percent difference, density, vernier resolution, micrometer resolution, and circumference/diameter ratios.
- Rebuild weak extracted figures as clean teaching visuals or canvas simulators: ruler, vernier caliper, and micrometer.
- Implement Teacher mode with step reveal, presenter notes, focus mode, demo-controls toggle, and keyboard shortcuts.
- Implement worksheet tables with averages, derived values, localStorage persistence, JSON export/import, reset, and print-friendly output.

## Content Rules

- Main language is Thai; keep short English UI labels only where useful for controls.
- Normalize terminology: `เวอร์เนียร์คาลิเปอร์`, `ไมโครมิเตอร์`, `สเกล`, `เซนติเมตร`, `ความคลาดเคลื่อน`, `โดยทำการวัด`, `ข้างต้น`, `แน่นอน`.
- Correct audit-listed source issues, including `0.1 m` to `0.1 cm`, spelling/spacing errors, duplicated micrometer labels, and raw scientific notation.
- Preserve all substantive source content: objectives, theory, instruments, examples, formulas, equipment, procedures, result tables, conclusion, and additional-research prompts.
- Include a full sequential manual section so the source can be audited against the Word document.

## Test Plan

- Open `index.html` directly from the filesystem and confirm the page loads without a backend/build step.
- Verify KaTeX renders formulas and no raw formula placeholders remain visible.
- Check Teacher mode, focus mode, reveal controls, keyboard shortcuts, simulator interactions, worksheet calculations, localStorage, reset, export/import JSON, and print mode.
- Verify desktop and mobile layouts: no text overlap, no unreadable Thai line breaks, no simulator overflow, and right rail/sidebar collapse correctly.
- Compare implementation against `../reference/content-audit.md`: every required content unit and worksheet prompt must be represented.

## Assumptions

- This implementation targets only `261111-lab-01-measurement`.
- Percentage error/difference use absolute-value forms for classroom clarity.
- The visual direction is a restrained professor briefing interface, not a landing page, dashboard, or infographic.
- Other labs should wait until this Lab 01 template is reviewed.
