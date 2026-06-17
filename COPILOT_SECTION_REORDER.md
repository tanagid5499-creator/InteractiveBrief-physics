# Prompt: จัดเรียง Sections + เพิ่ม additional-knowledge — 261111 Lab 01–10

> ส่งไฟล์นี้ให้ GitHub Copilot พร้อมกับ `index.html` ของบทที่ต้องการแก้
> อ่านทั้งหมดก่อนแก้ไขใดๆ — ห้ามลบเนื้อหาภาษาไทยที่มีอยู่แล้ว

---

## บริบทโปรเจกต์

- **Stack:** Vanilla HTML เท่านั้น — ห้ามเพิ่ม framework / build tool
- **Design system:** `../../shared/drafting-sheet.css`
- **ภาษา:** ไทย — ห้ามตัดทอนหรือแปลเนื้อหาที่มีอยู่เดิม
- **เอกสารอ้างอิงหลัก:** `HANDOFF.md` ที่ root ของโปรเจกต์

---

## ลำดับ Section ที่ถูกต้อง (เป้าหมาย)

```
hero → hook → objectives → concept → [theory] → equipment → formula
→ procedure → [practice] → data → [example] → checkpoint
→ analysis → conclusion → discussion → additional-knowledge
```

- `[theory]` `[practice]` `[example]` มีเฉพาะบางบท — ไม่ต้องเพิ่มถ้าไม่มี
- **สามส่วนท้าย** ต้องอยู่ในลำดับนี้เสมอ: **conclusion → discussion → additional-knowledge**

---

## งานที่ต้องทำแยกตามบท

### LAB 01 — แก้ bug (มี conclusion ซ้ำ + additional-knowledge ผิดตำแหน่ง)

**สถานะปัจจุบัน (ผิด):**
```
analysis → additional-knowledge → conclusion → discussion → conclusion (ซ้ำ!)
```

**วิธีแก้:**
1. ลบ `<section ... id="additional-knowledge" ...>` ทั้ง block ออกจากตำแหน่งเดิม (ก่อน conclusion แรก)
2. ลบ `<section ... id="conclusion" ...>` อันที่ **ซ้ำ** (อันสุดท้ายในไฟล์) ออกทั้ง block
3. ให้ `conclusion` อันแรกที่เหลืออยู่คงไว้ตรงที่เดิม
4. **เพิ่ม** `<section id="additional-knowledge">` ใหม่ (ดู template ด้านล่าง) ต่อจาก `</section>` ปิดของ `discussion`

**ผลลัพธ์ที่ถูกต้อง:**
```
analysis → conclusion → discussion → additional-knowledge
```

---

### LAB 02–10 — สลับลำดับ + เพิ่ม section ใหม่

**สถานะปัจจุบัน (ทุกบท):**
```
analysis → discussion → conclusion
```

**วิธีแก้:**
1. ตัด `<section ... id="discussion" ...>` ทั้ง block ออก
2. วางกลับ **หลัง** `</section>` ปิดของ `conclusion`
3. เพิ่ม `<section id="additional-knowledge">` (template ด้านล่าง) ต่อจาก `</section>` ปิดของ `discussion`

**ผลลัพธ์ที่ถูกต้อง:**
```
analysis → conclusion → discussion → additional-knowledge
```

---

## HTML Template: `additional-knowledge`

คัดลอก block นี้แล้วแทนที่เนื้อหาตาม**คู่มือเนื้อหารายบท**ด้านล่าง:

```html
    <!-- ══════════════ N · ADDITIONAL KNOWLEDGE ══════════════ -->
    <section class="section" id="additional-knowledge" data-title="ความรู้เพิ่มเติม">
      <header class="section-head">
        <div>
          <p class="kicker">เสริมความรู้</p>
          <h2>ความรู้ที่ได้เพิ่มเติม</h2>
        </div>
      </header>
      <div class="prose">
        <!-- เนื้อหาเสริมเฉพาะบท — ดูคู่มือด้านล่าง -->
      </div>
    </section>
```

> แทนที่ `N` ในคอมเมนต์ด้วยเลข section ที่ถูกต้อง (Lab 01 = 14, Lab 02–10 นับตามจริง)

---

## คู่มือเนื้อหา `additional-knowledge` รายบท

แทนที่ `<!-- เนื้อหาเสริมเฉพาะบท -->` ด้วย HTML ด้านล่าง ตรงกับบทที่กำลังแก้:

---

### Lab 01 · การวัดและเครื่องมือวัด

```html
<p>การวัดหลายครั้งมีความคลาดเคลื่อนสะสม — หลักการ <strong>การแพร่ความคลาดเคลื่อน</strong> (error propagation) ช่วยประมาณขอบเขตความไม่แน่นอนของผลลัพธ์สุดท้าย</p>
<p>ถ้า \(f = f(x, y)\) และ \(x, y\) มีความคลาดเคลื่อน \(\Delta x, \Delta y\) แล้ว:</p>
<p>\[\Delta f \approx \left|\frac{\partial f}{\partial x}\right|\Delta x + \left|\frac{\partial f}{\partial y}\right|\Delta y\]</p>
<p><strong>ตัวอย่าง:</strong> ปริมาตรทรงกระบอก \(V = \frac{\pi}{4}D^2 h\) — ถ้า \(\Delta D\) และ \(\Delta h\) ทราบ ความไม่แน่นอนของ \(V\) คือ \(\Delta V/V \approx 2(\Delta D/D) + (\Delta h/h)\)</p>
<div class="note note-info">
  <span class="note-icon" aria-hidden="true">◆</span>
  <div><span class="note-kind">ควรรู้</span><p>ในทางปฏิบัติ นิยมใช้ <strong>การแพร่ความคลาดเคลื่อนแบบกำลังสอง</strong> (quadrature): \(\Delta f = \sqrt{(\partial f/\partial x)^2 \Delta x^2 + (\partial f/\partial y)^2 \Delta y^2}\) ซึ่งให้ขอบเขตที่สมจริงกว่าแบบบวกตรง</p></div>
</div>
```

---

### Lab 02 · โมดูลัสของยัง

```html
<p>นอกจากโมดูลัสของยัง \(Y\) ที่วัดในบทนี้ วัสดุยังมีค่าความยืดหยุ่นอีกสองแบบ:</p>
<ul>
  <li><strong>Shear modulus (G):</strong> อัตราส่วนความเค้นเฉือนต่อความเครียดเฉือน — เกี่ยวข้องกับการบิดตัว</li>
  <li><strong>Bulk modulus (K):</strong> ความต้านทานต่อการอัดปริมาตร — สำคัญในของไหลและวัสดุรับแรงดัน</li>
</ul>
<p>ทั้งสามค่าสัมพันธ์กันผ่าน <strong>อัตราส่วนปัวซ็อง</strong> \(\nu\):</p>
<p>\[G = \frac{Y}{2(1+\nu)}, \quad K = \frac{Y}{3(1-2\nu)}\]</p>
<p>สำหรับเหล็กกล้า: \(Y \approx 2.0 \times 10^{11}\,\mathrm{Pa},\; \nu \approx 0.29\)</p>
<div class="note note-info">
  <span class="note-icon" aria-hidden="true">◆</span>
  <div><span class="note-kind">ควรรู้</span><p>วัสดุที่ \(\nu \approx 0.5\) (เช่น ยาง) แทบไม่เปลี่ยนปริมาตรเมื่อถูกดึง เรียกว่า <em>incompressible</em> — ใช้ประโยชน์ในการออกแบบซีลและปะเก็น</p></div>
</div>
```

---

### Lab 03 · คลื่นนิ่งในเส้นลวด

```html
<p>กฎของเมอร์แซน (Mersenne's laws) อธิบายความถี่ฮาร์โมนิกของเส้นลวด:</p>
<p>\[f_n = \frac{n}{2L}\sqrt{\frac{T}{\mu}}, \quad n = 1, 2, 3, \ldots\]</p>
<p>โดย \(L\) = ความยาวลวด, \(T\) = ความตึง, \(\mu\) = มวลต่อความยาว, \(n\) = ลำดับฮาร์โมนิก</p>
<p>ความถี่มูลฐาน (\(n=1\)) เรียกว่า <strong>first harmonic</strong> หรือ fundamental frequency — ฮาร์โมนิกที่สูงกว่าทำให้เสียงมีสีสัน (timbre) ต่างกัน</p>
<div class="note note-info">
  <span class="note-icon" aria-hidden="true">◆</span>
  <div><span class="note-kind">ควรรู้</span><p>ในเครื่องดนตรีประเภทสาย ช่างเปียโนปรับเสียงโดยเปลี่ยน \(T\) — เมื่อ \(T\) เพิ่มสี่เท่า ความถี่จะเพิ่มสองเท่า (ขึ้นหนึ่งอ็อกเทฟ)</p></div>
</div>
```

---

### Lab 04 · การสะท้อนและหักเหของแสง

```html
<p>เมื่อแสงเดินทางจากตัวกลางหนาแน่นกว่าไปสู่ตัวกลางเบากว่า และมุมตกกระทบเกินมุมวิกฤต \(\theta_c\) จะเกิด <strong>การสะท้อนกลับหมด</strong> (total internal reflection):</p>
<p>\[\sin\theta_c = \frac{n_2}{n_1} \quad (n_1 > n_2)\]</p>
<p>สำหรับแก้ว (\(n \approx 1.5\)) ในอากาศ: \(\theta_c \approx 41.8°\)</p>
<p>หลักการนี้เป็นพื้นฐานของ <strong>เส้นใยแก้วนำแสง</strong> (optical fiber) — แสงถูกกักให้สะท้อนภายในแกนแก้วได้เป็นระยะทางหลายกิโลเมตรโดยแทบไม่สูญเสียพลังงาน</p>
<div class="note note-info">
  <span class="note-icon" aria-hidden="true">◆</span>
  <div><span class="note-kind">ควรรู้</span><p>เพชรถูกเจียระไนให้มีมุมที่ทำให้แสงสะท้อนกลับหมดมากที่สุด (\(n_{\text{diamond}} \approx 2.42\), \(\theta_c \approx 24.4°\)) — นั่นคือสาเหตุที่เพชรดูแวววาวกว่าหินทั่วไป</p></div>
</div>
```

---

### Lab 05 · การแทรกสอดและเลี้ยวเบน

```html
<p><strong>กำลังแยก</strong> (resolving power) ของเครื่องมือทางแสงกำหนดว่าสามารถแยกแยะรายละเอียดเล็กสุดได้แค่ไหน ตามเกณฑ์เรย์ลี:</p>
<p>\[\theta_{\min} = 1.22\frac{\lambda}{D}\]</p>
<p>โดย \(D\) = เส้นผ่านศูนย์กลางรูรับแสง, \(\lambda\) = ความยาวคลื่น</p>
<p>กฎเบรกก์ (Bragg's law) ขยาย concept นี้ไปสู่การเลี้ยวเบนรังสีเอกซ์จากผลึก:</p>
<p>\[2d\sin\theta = m\lambda\]</p>
<p>ใช้กำหนดโครงสร้างระดับอะตอมของสสาร — นำไปสู่การค้นพบ DNA double helix และโปรตีนมากมาย</p>
<div class="note note-info">
  <span class="note-icon" aria-hidden="true">◆</span>
  <div><span class="note-kind">ควรรู้</span><p>กล้องโทรทรรศน์อวกาศฮับเบิล (D = 2.4 m, \(\lambda \approx 500\,\mathrm{nm}\)) มี \(\theta_{\min} \approx 0.05\,\mathrm{arcsec}\) — แยกรายละเอียดได้ละเอียดกว่าตามนุษย์ประมาณ 500 เท่า</p></div>
</div>
```

---

### Lab 06 · ความหนาแน่นและขวดความถ่วงจำเพาะ

```html
<p>หลักการของอาร์คิมีดีส: วัตถุที่จมในของไหลได้รับแรงลอยตัวเท่ากับน้ำหนักของของไหลที่ถูกแทนที่:</p>
<p>\[F_b = \rho_{\text{fluid}} \cdot V_{\text{submerged}} \cdot g\]</p>
<p>การประยุกต์ใช้ในชีวิตจริง: เรือเดินทะเลลอยได้เพราะปริมาตรของน้ำที่ถูกแทนที่มีมวลเท่ากับมวลเรือทั้งหมด (รวมอากาศในตัวเรือ)</p>
<p>ความหนาแน่นสัมพัทธ์ (specific gravity) ที่วัดในบทนี้ยังใช้ควบคุมคุณภาพในอุตสาหกรรม เช่น ตรวจสอบน้ำผึ้ง นม และน้ำมันเครื่อง</p>
<div class="note note-info">
  <span class="note-icon" aria-hidden="true">◆</span>
  <div><span class="note-kind">ควรรู้</span><p>เรือดำน้ำปรับความลึกด้วยการเติมหรือถ่ายน้ำในถังบัลลาสต์ — เปลี่ยนความหนาแน่นเฉลี่ยของยานให้เท่ากับน้ำทะเล (\(\rho \approx 1025\,\mathrm{kg/m^3}\)) เพื่อลอยตัว</p></div>
</div>
```

---

### Lab 07 · การตกอิสระและกฎข้อสองของนิวตัน

```html
<p>ในสภาพจริง วัตถุที่ตกได้รับ <strong>แรงต้านอากาศ</strong> ที่เพิ่มขึ้นตามความเร็ว:</p>
<p>\[F_d = \frac{1}{2}C_d \rho_{\text{air}} A v^2\]</p>
<p>เมื่อ \(F_d = mg\) วัตถุถึง <strong>ความเร็วปลาย</strong> (terminal velocity) แล้วไม่เร่งอีก:</p>
<p>\[v_t = \sqrt{\frac{2mg}{C_d \rho_{\text{air}} A}}\]</p>
<p>นักกระโดดร่มในท่านอน (\(A\) ใหญ่) มี \(v_t \approx 55\,\mathrm{m/s}\) ส่วนในท่าดิ่ง (\(A\) เล็ก) \(v_t \approx 90\,\mathrm{m/s}\)</p>
<div class="note note-info">
  <span class="note-icon" aria-hidden="true">◆</span>
  <div><span class="note-kind">ควรรู้</span><p>เม็ดฝนขนาด 2 mm มี \(v_t \approx 6.5\,\mathrm{m/s}\) — ถ้าไม่มีแรงต้านอากาศ เม็ดฝนที่ตกจากความสูง 2 km จะมีความเร็วกระทบพื้นถึง \(\approx 200\,\mathrm{m/s}\) ซึ่งเป็นอันตรายมาก</p></div>
</div>
```

---

### Lab 08 · สมมูลระหว่างไฟฟ้าและความร้อน

```html
<p>กฎของจูล (Joule's law) ระบุว่าพลังงานความร้อนที่ผลิตโดยกระแสไฟฟ้า:</p>
<p>\[Q = I^2 R t = VIt = \frac{V^2}{R}t\]</p>
<p>ค่า <strong>ความจุความร้อนจำเพาะ</strong> ของน้ำ \(c = 4186\,\mathrm{J/(kg\cdot K)}\) เป็นค่าสูงที่สุดในบรรดาของเหลวทั่วไป — เป็นเหตุผลที่น้ำถูกใช้เป็นสารหล่อเย็นในอุตสาหกรรมและระบบทำความเย็น</p>
<p>ในบทนี้ \(J = Q_{\text{elec}} / Q_{\text{heat}}\) ควรใกล้ \(4.186\,\mathrm{J/cal}\) (mechanical equivalent of heat)</p>
<div class="note note-info">
  <span class="note-icon" aria-hidden="true">◆</span>
  <div><span class="note-kind">ควรรู้</span><p>มหาสมุทรดูดซับความร้อนจากดวงอาทิตย์และปล่อยออกช้า — ความจุความร้อนสูงของน้ำทะเลทำให้เมืองชายฝั่งมีอากาศอบอุ่นกว่าพื้นที่ภายในทวีปในฤดูหนาว</p></div>
</div>
```

---

### Lab 09 · แรงและสมดุล

```html
<p>เมื่อวัตถุอยู่ในสมดุลสถิต เงื่อนไขที่ต้องเป็นจริงพร้อมกัน:</p>
<p>\[\sum \vec{F} = 0 \quad \text{และ} \quad \sum \vec{\tau} = 0\]</p>
<p>ในการทดลองนี้ แรงตึงในเส้นเชือกแต่ละเส้นคือผลลัพธ์จากเวกเตอร์รวมของแรงทั้งหมด — การวาด <strong>แผนภาพวัตถุอิสระ</strong> (free body diagram) ก่อนคำนวณทำให้ไม่พลาดแรงที่ซ่อนอยู่</p>
<p>แรงเสียดทาน \(f = \mu N\) มีบทบาทซ่อนเร้น: ถ้าพื้นผิวรอกหรือรูเชือกไม่ลื่น ค่าแรงตึงที่วัดได้จะเบี่ยงเบนจากทฤษฎี</p>
<div class="note note-info">
  <span class="note-icon" aria-hidden="true">◆</span>
  <div><span class="note-kind">ควรรู้</span><p>โครงสร้างสะพานแขวนใช้หลักการสมดุลเวกเตอร์เดียวกัน — สายเคเบิลหลักรับแรงดึงมหาศาลในแนวเฉียง ซึ่งแตกองค์ประกอบเป็นแรงดึงแนวนอนและแรงยกแนวตั้ง</p></div>
</div>
```

---

### Lab 10 · ลูกตุ้มและการเคลื่อนที่แบบฮาร์โมนิก

```html
<p>ลูกตุ้มอุดมคติไม่มีการสูญเสียพลังงาน แต่ในความเป็นจริง <strong>การหน่วง</strong> (damping) ทำให้แอมพลิจูดลดลงตามเวลา:</p>
<p>\[A(t) = A_0 e^{-\gamma t/2}\cos(\omega' t + \phi)\]</p>
<p>โดย \(\gamma\) = สัมประสิทธิ์การหน่วง, \(\omega' = \sqrt{\omega_0^2 - (\gamma/2)^2}\)</p>
<p>ถ้าหน่วงน้อย (\(\gamma \ll \omega_0\)) คาบยังใกล้เคียงสูตรเดิม — นี่คือเหตุผลที่ลูกตุ้มนาฬิกาโบราณยังเที่ยงได้แม้มีแรงเสียดทาน (ระบบไขลานชดเชยการสูญเสียพลังงาน)</p>
<div class="note note-info">
  <span class="note-icon" aria-hidden="true">◆</span>
  <div><span class="note-kind">ควรรู้</span><p>ลูกตุ้มฟูโกต์ (Foucault pendulum) แกว่งต่อเนื่องหลายชั่วโมงโดยระนาบการแกว่งหมุนช้าๆ — พิสูจน์การหมุนของโลกโดยไม่ต้องออกไปอวกาศ</p></div>
</div>
```

---

## Checklist ก่อน Submit

```
[ ] สามส่วนท้ายเรียงถูก: conclusion → discussion → additional-knowledge
[ ] ไม่มี id="conclusion" ซ้ำ (Lab 01 เท่านั้นที่มีปัญหานี้)
[ ] additional-knowledge มีเนื้อหาตรงกับบทนั้น (ไม่ใช่ placeholder)
[ ] เนื้อหาเดิมใน discussion และ conclusion ยังครบ ไม่ถูกตัด
[ ] phase-nav ใน <header> อัปเดต href ถ้าเพิ่ม section ใหม่ที่ต้องลิงก์
[ ] data-title ในทุก section ถูกต้องตามภาษาไทย
[ ] ไม่มี console error จาก JS (เปิดใน browser ตรวจ DevTools)
```

---

## หมายเหตุเรื่อง Phase Navigation

ถ้า Lab มี phase-nav ลิงก์ไปที่ `#discussion` หรือ `#conclusion` ให้ตรวจสอบว่า href ยังถูกต้อง (id ไม่เปลี่ยน ดังนั้นปกติไม่ต้องแก้) แต่ถ้าต้องการเพิ่มลิงก์ไปยัง `#additional-knowledge` ให้เพิ่มใน phase "สรุปผล":

```html
<a class="chip" role="menuitem" href="#additional-knowledge">ความรู้เพิ่มเติม</a>
```
