# HANDOFF — InteractiveBrief (261111 / 261112 Physics Lab Briefs)

> เอกสารส่งมอบงานสำหรับผู้ทำต่อ (รวมถึง AI agent เช่น Codex) — อ่านไฟล์นี้ให้จบก่อนเริ่ม
> อัปเดต: 2026-06-12 · สถานะ: **261111 = 10/10 พร้อม Bloom + รูปอุปกรณ์ 52/58 การ์ด, 261112 = 9/9 (สร้าง+verify ครบ)** · เหลือ: รูป 261111 อีก 6 รายการ, Bloom/รูป 261112, clicker production

---

## 0. โปรเจกต์นี้คืออะไร
แปลงคู่มือปฏิบัติการฟิสิกส์ (ภาษาไทย) เป็น **"Lab Brief" เว็บโต้ตอบ** สำหรับอาจารย์เปิดสอนหน้าชั้น
ดีไซน์ **"Drafting Sheet"** (light blueprint: น้ำเงิน-ขาว, drafting-red, crop marks, mono สำหรับตัวเลข)
- **Vanilla HTML/CSS/JS — ไม่มี build, ไม่มี framework, ไม่มี Tailwind, ไม่มี npm** (ตั้งใจให้เป็นเช่นนี้ ห้ามเปลี่ยน)
- 2 คอร์ส: **261111 (ฟิสิกส์ 1, 10 บท)** + **261112 (ฟิสิกส์ 2, 9 บท)**
- ฟอนต์: Sarabun (ไทย) + IBM Plex Mono (ตัวเลข) · คณิตศาสตร์: **KaTeX** (CDN, pin 0.16.9)

## 1. วิธีรัน / verify
- เสิร์ฟจาก **root นี้** (`InteractiveBrief`) เพราะทุก lab ลิงก์ `../../shared/`
  `python serve.py` แล้วเปิด `http://127.0.0.1:8000/` (หน้า Hub) · หรือ VSCode Live Server ที่ `index.html`
  (`serve.py` ลงทะเบียน MIME `image/webp` ให้ Windows/Python ที่ไม่รู้จักนามสกุลนี้)
- รัน `python verify_project.py` ก่อนและหลังแก้งานสำคัญ เพื่อตรวจจำนวนบท, shared cache version,
  asset, โครง HTML, Bloom metadata, ตัวเลือก A–E และ baseline รูปอุปกรณ์
- ⚠️ **อย่า verify ด้วย screenshot** (preview screenshot timeout เสมอในโปรเจกต์นี้) — ใช้การอ่าน DOM/computed แทน
  (เช่น `getComputedStyle`, `el.textContent`, จำลองกรอก input แล้วเช็คผลลัพธ์)
- เช็ค overflow: `document.body.scrollWidth === document.body.clientWidth` (อย่าใช้ `documentElement` — มี phantom จากตาราง)
- checklist ต่อบท: 14 sections · KaTeX 0 error (`.katex-error`=0) · console 0 error · กรอกค่าตัวอย่างแล้วผลตรงสูตร · body overflow 0

## 2. โครงสร้างไฟล์
```
index.html                         ← Hub: การ์ดสารบัญ 261111 ×10 + 261112 ×9
shared/
  drafting-sheet.css?v=7           ← design systemกลาง (ทุก lab ใช้ร่วม)
  brief-core.js?v=7                ← JS infra กลาง (ดูข้อ 3)
<course>-lab-<NN>-<slug>/
  interactive-lab/
    index.html                     ← เทมเพลต 14 sections (เนื้อหาเฉพาะบท)
    styles.css?v=1                 ← stub override (ปกติแค่คอมเมนต์)
    js/app.js?v=1                  ← ฟิสิกส์เฉพาะบท → เรียก B.init(...)
clicker/                           ← เดโม clicker (ดูข้อ 6)
  index.html · host.html · respond.html · questions.js
PHOTO_CHECKLIST.md / .pdf          ← เช็คลิสต์รูปอุปกรณ์ (ดูข้อ 7)
CLAUDE.md                          ← จุดเริ่มต้นสำหรับ Claude Code
NEXT_STEPS.md                      ← คิวงานถัดไป + acceptance criteria
verify_project.py                 ← ตัวตรวจโครงสร้างแบบไม่ใช้ dependency ภายนอก
SOURCE_MANIFEST.md                ← แผนที่แหล่งข้อมูลแบบ portable
```

## 3. สถาปัตยกรรม — `shared/brief-core.js`
ทุก lab โหลด shared แล้ว `app.js` เรียก:
```js
const B = window.Brief;
const { $, $$, plotXY, slopeThroughOrigin } = B;
B.init({ store: "labXX-...-v1", defaults: {inputId: value}, onInput: updateWorksheet, onReady: () => renderExample() });
```
**helper ที่มีให้ (window.Brief):**
- `numberFrom(id)`, `average(arr)`, `percentError(y, ref)`
- `fv(v)` / `fvK(v)` — จัด format ตัวเลขเป็น HTML / KaTeX (4 sig figs, เป็น sci เมื่อ |v|≥1e5 หรือ <1e-3)
- `plotXY(svg, pts, {slope, xlabel, ylabel})` — scatter + เส้นเทรนด์ **ผ่านจุดกำเนิด** (ใส่ `slope`)
- `slopeThroughOrigin(pts)` — least-squares ผ่าน origin = Σxy/Σx²
- `showToast(msg, undoFn)` · `renderMath()` · quiz auto-wire
- `labelTableInputs()` — **ใส่ `aria-label` ให้ input ในตารางอัตโนมัติ** (จากหัวคอลัมน์+แถว) → อย่าใส่เอง
- `init()` ผูก: nav/scroll-spy, present mode, ratio toggle, lightbox, reveals, localStorage store

**brief-core ทำงานเอง (ไม่ต้องเขียนใน app.js):** phase-nav dropdown, scroll-spy, stepper, present (deck) mode,
4:3/16:9 ratio, equipment lightbox, scroll reveals, localStorage ของ `[data-store]`, quiz `.quick-quiz`.

**2 แพตเทิร์นของ section ตารางข้อมูล:**
- (ก) ตารางหลายแถว + กราฟ slope-ผ่าน-origin — ดู `261112-lab-02-resistivity`, `261112-lab-03-light-spectrum`, `261111-lab-10-pendulum`
- (ข) เครื่องคิดเลข (ไม่มีกราฟ) — ดู `261112-lab-01-dc-circuits`, `261112-lab-05/06/09`

## 4. กฎ/ข้อตกลงสำคัญ (ห้ามพลาด)
- **bump `?v=N`** ของ shared (ทั้ง drafting-sheet.css และ brief-core.js) ใน **ทุก** lab index.html เมื่อแก้ไฟล์ shared
  (ปัจจุบัน **v=8**) — บัมป์หลังแก้เสร็จ (browser cache `?v=N` URL ด้วยของเดิมถ้าบัมป์ก่อนแก้)
  > **v=8 (Gestalt redesign):** ลด "กล่อง" ทั่วทั้งระบบตามหลัก Gestalt — quiz ไร้กรอบ (option แถวเท่ากัน,
  > ตัวอักษร A–E ล้วน), de-box info/formula/objective/step/q-card (เหลือเส้นคั่น+marker), callout แยก
  > **ข้อควรระวัง**(อำพัน)/​**ควรรู้**(น้ำเงิน) มี `.note-kind` eyebrow, รูปอุปกรณ์ `object-fit:cover` เต็มกรอบ,
  > spacing rhythm, `.step-caution`/`.cp-extra`, token `--caution-ink`. บล็อกอยู่ท้าย `shared/drafting-sheet.css`.
  > เนื้อหาเฉพาะบท (ป้าย `.note-kind`, ข้อ 5 สรุป, per-step cautions, hero ใหม่) ต้องเติมราย index.html เอง — เริ่มที่ lab-01 (ครบแล้ว).
- **ค่าคงที่การคำนวณต้องตรงเอกสารต้นฉบับ** (เช่น g=9.80, R_H=1.097×10⁷, ฯลฯ) — อย่าเปลี่ยน
- **อย่าใส่ negative letter-spacing บนข้อความไทย** (ชนกับวรรณยุกต์)
- KaTeX: เขียน `\( … \)` (inline) / `\[ … \]` (display) ในเนื้อหา (auto-render); readout สดใช้ `B.fvK(value)`
- `[hidden] { display:none !important }` จำเป็น · อย่า gate การมองเห็นเนื้อหาด้วย scroll animation (เคยทำหน้าโล่ง)

## 5. สถานะปัจจุบัน (verify แล้วทั้งหมด)
**261111 (เทอม 1) — 10/10 บท ✅** ตรงเล่ม `LabNN.pdf` 1:1:
01 การวัด · 02 ยัง · 03 คลื่นนิ่ง · 04 สะท้อน/หักเห · 05 แทรกสอด/เลี้ยวเบน · 06 ความหนาแน่น ·
07 ตกอิสระ+นิวตัน2 · 08 สมมูลไฟฟ้า-ความร้อน · 09 แรง · 10 ลูกตุ้ม

**261112 (เทอม 2) — 9/9 บท ✅** ตรงเล่ม `ปฏิบัติการที่ N _20260611.pdf` 1:1:
01 DC (320Ω/68.8Ω) · 02 resistivity (ρ=1.10×10⁻⁶) · 03 spectrum (R_H=1.097×10⁷) · 04 radiation (T½=3.83) ·
05 electric-field/อิออน (E=V/d) · 06 magnetic-emf (B=μ₀nI, ε=NΔΦ/Δt) · 07 galvanometer-wheatstone (R_x=R_s·L₁/L₂) ·
08 RC (τ=100s, C=1000µF) · 09 AC (Z, f₀)
> หมายเหตุล่าสุดจากเจ้าของงาน: **โฟกัสเทอม 1 ก่อน** (261112 สร้างเสร็จแล้วแต่พักงานเสริมไว้)

**Bloom 261111:** ครบ **10/10 บท** แล้ว — บท 01 มี 8 ข้อ, บท 02–10 มีบทละ 6 ข้อ ครบ 6 ระดับ
ทุกข้อใช้ตัวเลือก A–E และมี `data-qid` / `data-bloom` / `data-answer` พร้อมนำไปทำคลัง Clicker ใน Phase 2
**Clicker:** มีเดโม local ที่ `clicker/` (verify ทำงานแล้ว)
**รูปอุปกรณ์ 261111:** ใส่รูปจริงแล้ว **52/58 การ์ด** เป็น WebP 1200×675 รวมประมาณ 1.79 MB
อยู่ใน `interactive-lab/assets/equip/` ของแต่ละบท และ lightbox ใช้งานกับ `<img>` ได้
ยังคง SVG ไว้ 6 รายการที่ไม่มีรูปตรงชนิด: 04 จอรับแสง · 06 กระดาษซับ · 07 ชุด Atwood/นาฬิกาจับเวลา · 08 นาฬิกา+เครื่องชั่ง · 10 นาฬิกาจับเวลา

## 6. การตัดสินใจที่ "ล็อกแล้ว" (อย่ารื้อ)
- ดีไซน์ = Drafting Sheet, vanilla no-build — **ห้ามแปลงเป็น framework/build tool**
- **Bloom:** 6 ระดับ (จำ/เข้าใจ/ประยุกต์/วิเคราะห์/ประเมิน/สร้างสรรค์) · ตัวเลือกแบบ **ABCDE** · ระดับเป็น
  **metadata ซ่อน** (`data-bloom`, ไม่โชว์ผู้เรียน) · ทุกข้อ clicker-ready (`data-qid` + `data-answer="<ตัวอักษร>"`)
  โครงปุ่ม: `<button data-quiz-option="A"><b class="qo-key">A</b> ข้อความ>` (ดู lab-01 measurement เป็นแม่แบบ)
- **Clicker (สเปกจากเจ้าของงาน):** **ไม่เฉลยถูก/ผิดทุกที่** (เป็นโพลล์ดูจำนวนผู้เลือกแต่ละข้อ ไม่ไฮไลต์ข้อถูก) ·
  ตอบไม่ระบุชื่อ · **รีเซ็ตข้อมูลตอบรายคลาสได้** · **เฉพาะอาจารย์เข้าคุม/จัดการได้** ·
  เวอร์ชันจริง = **Supabase Realtime + QR + deploy (GitHub Pages/Netlify)** ; เดโม local ใช้ BroadcastChannel
- ชื่อหัวข้อ/โฟลเดอร์ = **ยึดตามหนังสือ**

## 7. เดโม Clicker (`clicker/`)
- `index.html` = landing (2 ปุ่ม) · `host.html` = จอครู (คำถาม+แท่งนับสด+ปุ่มคุม) · `respond.html` = จอนิสิต (กด A–E แบบ dynamic) ·
  `questions.js` = คลังคำถาม (ตอนนี้ hardcode 8 ข้อของบทการวัด)
- กลไก: BroadcastChannel ชื่อ `labclicker-261111-measurement` · ข้อความ: `{type:"state",...}` (ครู→นิสิต),
  `{type:"vote",...}` (นิสิต→ครู), `{type:"hello"}` (นิสิตขอสถานะ) · dedupe ด้วย `clientId` ใน localStorage
- ⚠️ BroadcastChannel = เบราว์เซอร์เดียว เครื่องเดียว (เดโมเท่านั้น) — เวอร์ชันจริงสลับเป็น Supabase (โครงข้อความเดิม)

## 8. แหล่งเนื้อหา
| เล่ม | = คอร์ส | หัวข้อ |
|---|---|---|
| `Lab01.pdf`…`Lab10.pdf` + `Labภาคผนวก.pdf` | **261111** | ตรงโฟลเดอร์ 1:1 (verify แล้ว) |
| `ปฏิบัติการที่ N _20260611.pdf` (1–9 + ภาคผนวกก) | **261112** | ตรงโฟลเดอร์ 1:1 (verify แล้ว) |
| `ปฏิบัติการที่ N _20260609.pdf` (3–10 + ภาคผนวกกขค) | ผสม | 3,4,6,7,10 ซ้ำ 261111; 5=รังสี,8=DC,9=RC |
- path PDF เดิมเป็น path เฉพาะเครื่องเจ้าของงานและไม่ได้รวมใน repository นี้ จึงไม่ควรใช้เป็น dependency
- ถ้าได้รับ PDF ต้นฉบับใหม่ ให้บันทึกตำแหน่งแบบ repository-relative หรือ shared-drive ไว้ใน `SOURCE_MANIFEST.md`
- แหล่งรูปอุปกรณ์ที่คาดไว้คือโฟลเดอร์ข้าง repository: `..\ภาพอุปกรณ์การทดลอง\`

## 9. งานที่เหลือ — ลำดับละเอียด
### Phase 1 · Bloom rollout
1. ✅ ย้าย CSS `.qo-key` ไป `shared/drafting-sheet.css` และเคย bump เป็น `?v=6`; ปัจจุบัน shared เป็น `?v=7` หลังเพิ่มการรองรับรูปอุปกรณ์
2. ✅ ใส่คำถาม Bloom ครบ 6 ระดับใน **261111 บท 02–10** แล้ว:
   - ตำแหน่ง: hook=จำ · theory=เข้าใจ/ประยุกต์ · checkpoint=วิเคราะห์ · analysis=ประเมิน · discussion=สร้างสรรค์
   - ทุกข้อเป็นตัวเลือก A–E พร้อม `data-qid`/`data-bloom`/`data-answer`
3. งานถัดไปของ Phase นี้: ทำซ้ำกับ 261112 ทั้ง 9 บทเมื่อกลับมาโฟกัสเทอม 2
### Phase 2 · Clicker production (ใช้ในคลาสจริง)
4. ทำ **Phase 2A** ตาม `NEXT_STEPS.md`: คลังคำถาม 261111 ครบ 62 ข้อ + ให้ host เลือกคอร์ส/บทได้ โดยยังใช้ BroadcastChannel สำหรับเดโม local
5. ทำ **Phase 2B** เมื่อได้ credentials/ข้อกำหนดจากเจ้าของงาน: สลับ transport เป็น **Supabase Realtime**
6. เพิ่ม **QR code** บน host (ชี้ URL respond) + รหัสห้อง/PIN + **auth ให้เฉพาะอาจารย์เปิด host/คุม** + ปุ่มรีเซ็ตรายคลาส
7. **Deploy** ขึ้น GitHub Pages/Netlify (ฟรี) เพื่อให้มือถือนิสิตเข้าถึง
### Phase 3 · รูปอุปกรณ์
8. ✅ 261111 ใส่รูปจริงแล้ว 52/58 การ์ด พร้อมย่อเป็น WebP 1200×675 และแทน SVG
   - ยังขาด 6 รายการ: จอรับแสง, กระดาษซับ, ชุด Atwood, นาฬิกาจับเวลาในบท 07/10, และนาฬิกา+เครื่องชั่งบท 08
   - เมื่อได้รูปเพิ่ม ให้ใช้ชื่อ `assets/equip/equip-N.webp` ตามลำดับการ์ด แล้วแทน SVG ที่เหลือ
   - งานรูปถัดไป: ทำ 261112 หลังคัดและจับคู่รูปแต่ละบท
### Phase 4 · เก็บกวาด/เสริม
9. หน้า "ภาคผนวก/อ้างอิงรวม" (ความคลาดเคลื่อน + การเขียนกราฟ) เชื่อมจาก Hub
10. ตรวจ accessibility และ print layout ทุกบท

## 10. ความสะอาดของโปรเจกต์
โครงหลักที่ใช้งานจริง: **261111 ×10 · 261112 ×9** · `shared/` · `clicker/` · `index.html` (Hub) · เอกสารส่งมอบ
ไฟล์ artifact จากเครื่องมือทดสอบอาจยังอยู่ในบาง lab; อย่าลบแบบเหมารวมจนกว่าจะยืนยันว่าไม่ถูกใช้งาน
⚠️ **261112 ทั้ง 9 บท = ของจริง สร้างเสร็จแล้ว อย่าลบ** (แค่พักงานเสริม ไว้ทำ Bloom/รูปทีหลัง — โฟกัสเทอม 1 ก่อน)
