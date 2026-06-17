# Prompt: ปรับ 261111 Lab 02–10 ให้ตรงมาตรฐาน Lab 01

> ส่งไฟล์นี้ให้ GitHub Copilot (หรือ AI อื่น) พร้อม `index.html` ของบทที่ต้องการแก้
> อ่านทั้งหมดก่อนแก้ไขใดๆ

---

## บริบทโปรเจกต์

- **ชื่อ:** InteractiveBrief — Lab Brief เว็บโต้ตอบสำหรับวิชาปฏิบัติการฟิสิกส์ 261111
- **Stack:** Vanilla HTML/CSS/JS เท่านั้น — ห้ามเพิ่ม framework, build tool, หรือ npm
- **Design system:** `../../shared/drafting-sheet.css?v=10` (Blueprint: น้ำเงิน-ขาว, mono สำหรับตัวเลข)
- **Shared JS:** `../../shared/brief-core.js?v=7`
- **แม่แบบอ้างอิง:** `261111-lab-01-measurement/interactive-lab/index.html` (ครบ 100%)
- **ภาษา:** ไทย ทั้งหมด — ห้ามลบหรือย่อเนื้อหาภาษาไทย
- **ห้ามเด็ดขาด:** แก้ค่าคงที่ทางฟิสิกส์, ลบ section, เพิ่ม dependency

---

## สิ่งที่ต้องตรวจและแก้ในแต่ละ Lab

### 1. `<head>` — cache version ของ shared files

ต้องเป็น `?v=10` สำหรับ CSS และ `?v=7` สำหรับ JS:

```html
<!-- ✅ ถูกต้อง -->
<link rel="stylesheet" href="../../shared/drafting-sheet.css?v=10">
<link rel="stylesheet" href="styles.css?v=1">
<script defer src="../../shared/brief-core.js?v=7"></script>
<script defer src="js/app.js?v=1"></script>
```

ถ้า `?v=N` เป็นเลขเก่ากว่า → อัปเดตเฉพาะ shared (`drafting-sheet.css` และ `brief-core.js`) ให้ตรงตามข้างบน  
`styles.css` และ `app.js` คงเลขเดิมของบทนั้น

---

### 2. Hero section — `.hero-visual`

Lab 01 ใช้รูปถ่ายจริง (`fig-photo`):
```html
<figure class="hero-visual fig-photo">
  <span class="fig-tag">FIG.1 · ชื่ออุปกรณ์</span>
  <div class="fig-photo-wrap">
    <img src="assets/equip/FILENAME.webp" width="1200" height="675"
         decoding="async" alt="คำอธิบายภาษาไทยละเอียด">
    <span class="fig-pin" style="left:XX%;top:YY%">ชื่อส่วน</span>
    <!-- เพิ่ม fig-pin ตามส่วนสำคัญของอุปกรณ์ -->
  </div>
  <figcaption>ประโยคสั้นอธิบายวิธีใช้/วิธีอ่าน</figcaption>
</figure>
```

Lab อื่นที่ยังใช้ SVG (`<figure class="hero-visual">` + `<svg ...>`) → **ยังไม่ต้องแก้** ถ้าไม่มีรูปถ่ายจริงให้ใช้

---

### 3. Note blocks — ต้องมี `.note-kind` eyebrow

**ข้อควรระวัง (อำพัน):**
```html
<div class="note note-caution">
  <span class="note-icon" aria-hidden="true">⚠</span>
  <div>
    <span class="note-kind">ข้อควรระวัง</span>
    <strong>หัวข้อสั้น</strong>
    <p>รายละเอียด...</p>
  </div>
</div>
```

**ควรรู้ (น้ำเงิน):**
```html
<div class="note note-info">
  <span class="note-icon" aria-hidden="true">◆</span>
  <div>
    <span class="note-kind">ควรรู้</span>
    <strong>หัวข้อสั้น</strong>
    <p>รายละเอียด...</p>
  </div>
</div>
```

❌ ถ้า note ใดไม่มี `<span class="note-kind">` → เพิ่มเข้าไปก่อน `<strong>`  
❌ ถ้า note ใช้รูปแบบเก่า (เช่น `<aside class="callout">`) → เปลี่ยนเป็น pattern ข้างบน

---

### 4. Procedure steps — `.step-caution`

ทุก step ที่มีอันตรายหรือข้อผิดพลาดที่พบบ่อย ต้องมี:
```html
<li>
  <span class="step-n">3</span>
  <div>
    <h3>ชื่อขั้นตอน</h3>
    <p>รายละเอียดขั้นตอน...</p>
    <p class="step-caution"><b>ระวัง:</b> ข้อควรระวังเฉพาะขั้นตอนนี้</p>
  </div>
</li>
```

`<p class="step-caution">` อยู่ใน `<div>` ของ step นั้น ไม่ใช่ step แยก

---

### 5. Bloom questions — รูปแบบบังคับ

**ทุกบทต้องมีครบ 6 ระดับ** (remember / understand / apply / analyze / evaluate / create)  
**Lab 02–10 มีบทละ 6 ข้อ** · Lab 01 มี 8 ข้อ

รูปแบบปุ่มตัวเลือก:
```html
<div class="quick-quiz" data-qid="LABID-BLOOM" data-bloom="LEVEL" data-answer="LETTER">
  <p class="quiz-label">ลองตอบเร็ว</p>
  <h3 class="prompt-q">คำถาม...</h3>
  <div class="quiz-options">
    <button type="button" data-quiz-option="A"><b class="qo-key">A</b> ข้อความ A</button>
    <button type="button" data-quiz-option="B"><b class="qo-key">B</b> ข้อความ B</button>
    <button type="button" data-quiz-option="C"><b class="qo-key">C</b> ข้อความ C</button>
    <button type="button" data-quiz-option="D"><b class="qo-key">D</b> ข้อความ D</button>
    <button type="button" data-quiz-option="E"><b class="qo-key">E</b> ข้อความ E</button>
  </div>
  <p class="quiz-feedback" data-quiz-feedback aria-live="polite"></p>
</div>
```

กฎ:
- `data-qid` รูปแบบ: `[slug]-[bloom]` เช่น `ym-remember`, `sw-apply`
- `data-bloom`: `remember` | `understand` | `apply` | `analyze` | `evaluate` | `create`
- `data-answer`: ตัวอักษร A–E (ข้อที่ถูกต้อง)
- ห้ามโชว์ข้อถูก/ผิดในตัว HTML (brief-core.js จัดการ)
- ตัวเลือกต้องครบ **A B C D E** เสมอ

**ตำแหน่งวางใน section:**
- `#hook` → remember
- `#concept` → understand + apply (ใส่ใน info-card หรือ aside.prompt-card)
- `#checkpoint` → analyze
- `#analysis` → evaluate
- `#discussion` → create

---

### 6. Equipment cards — รูปแบบมาตรฐาน

```html
<figure class="equip-card">
  <button class="equip-photo" type="button" data-photo
          aria-label="ดูภาพขยาย: ชื่ออุปกรณ์">
    <img src="assets/equip/equip-N.webp" alt=""
         width="1200" height="675" loading="lazy" decoding="async">
    <span class="equip-zoom" aria-hidden="true">⤢ ดูภาพขยาย</span>
  </button>
  <figcaption>
    <h3>ชื่ออุปกรณ์</h3>
    <p>คำอธิบายการใช้งานและข้อสังเกต</p>
  </figcaption>
</figure>
```

- `alt=""` บน `<img>` ข้างใน (ใช้ aria-label บน `<button>` แทน)
- ถ้าไม่มีรูปจริง (`equip-N.webp`) → ใช้ `<svg>` placeholder ห้ามใส่ URL ภายนอก
- ขนาดมาตรฐาน WebP: `width="1200" height="675"` (16:9)

---

### 7. คณิตศาสตร์ — KaTeX

- Inline: `\( สมการ \)`
- Display (บรรทัดเดี่ยว): `\[ สมการ \]`
- Readout สด (JS): `B.fvK(value)` คืน KaTeX HTML string
- ห้ามใช้ MathML โดยตรง

---

### 8. สิ่งที่ห้ามแก้

| สิ่ง | เหตุผล |
|---|---|
| ค่าคงที่ทางฟิสิกส์ (g, Y_ref, R_H ฯลฯ) | ต้องตรงเอกสารต้นฉบับ |
| ลำดับ section และ id attribute | phase-nav และ scroll-spy ขึ้นกับ id |
| `data-store` attribute บน input | localStorage key — ถ้าเปลี่ยนข้อมูลเก่าหาย |
| `data-qid` ที่มีอยู่แล้ว | clicker registry ใช้ id นี้ |
| เนื้อหาภาษาไทยทั้งหมด | ห้ามตัดทอน |
| `styles.css?v=N` ของแต่ละบท | อัปเดตเฉพาะ shared เท่านั้น |

---

## Checklist ก่อน Submit

```
[ ] shared CSS เป็น ?v=10 และ shared JS เป็น ?v=7
[ ] note ทุกอันมี <span class="note-kind">
[ ] step ที่เสี่ยงมี <p class="step-caution">
[ ] Bloom quiz ครบ 6 ระดับ มี A–E ทุกข้อ
[ ] data-qid, data-bloom, data-answer ถูกต้องครบ
[ ] ไม่มี console error (KaTeX, JS)
[ ] ไม่มีการเพิ่ม dependency หรือ link ภายนอกใหม่
[ ] เนื้อหาภาษาไทยครบไม่ถูกตัด
```

---

## ตัวอย่าง: Lab 02 — โมดูลัสของยัง

slug สำหรับ `data-qid`: `ym`

| Bloom level | data-qid | ตำแหน่งใน section |
|---|---|---|
| remember | `ym-remember` | `#concept` (inside aside.prompt-card) |
| understand | `ym-understand` | `#hook` (inside aside.prompt-card) |
| apply | `ym-apply` | `#concept` หรือ `#formula` |
| analyze | `ym-analyze` | `#checkpoint` |
| evaluate | `ym-evaluate` | `#analysis` |
| create | `ym-create` | `#discussion` |

slug Lab อื่นๆ:
- Lab 03: `sw` (standing waves)
- Lab 04: `rr` (reflection-refraction)
- Lab 05: `id` (interference-diffraction)
- Lab 06: `ds` (density-specific-gravity)
- Lab 07: `ff` (free-fall)
- Lab 08: `eh` (electrical-heat)
- Lab 09: `fo` (force)
- Lab 10: `pd` (pendulum)
