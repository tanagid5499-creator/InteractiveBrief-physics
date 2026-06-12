# Interactive Physics Lab Briefs

เว็บ Lab Brief แบบโต้ตอบสำหรับรายวิชาปฏิบัติการฟิสิกส์:

- `261111` ปฏิบัติการฟิสิกส์ 1 จำนวน 10 บท
- `261112` ปฏิบัติการฟิสิกส์ 2 จำนวน 9 บท

โครงการใช้ Vanilla HTML, CSS และ JavaScript ไม่มี framework, npm หรือขั้นตอน
build แต่ละบทสามารถเปิดใช้งานแยกจากกันได้

## Current Status

- Lab Brief ครบ 19/19 บท
- `261111` มีคำถาม Bloom ครบ 10 บท รวม 62 ข้อ
- ทุกข้อของ `261111` มีตัวเลือก A-E และ metadata สำหรับ clicker
- รูปอุปกรณ์ `261111` เป็น WebP แล้ว 52/58 การ์ด
- Clicker local demo ใช้ `BroadcastChannel` และรองรับ Lab 01
- Shared asset cache version ปัจจุบันคือ `?v=7`

## Run Locally

```powershell
python verify_project.py
python serve.py
```

จากนั้นเปิด [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

สามารถกำหนด host หรือ port ได้:

```powershell
python serve.py --host 127.0.0.1 --port 8138
```

## Project Structure

```text
index.html
shared/
clicker/
261111-lab-01-*/ ... 261111-lab-10-*/
261112-lab-01-*/ ... 261112-lab-09-*/
serve.py
verify_project.py
```

แต่ละบทมีโครงสร้าง:

```text
<course>-lab-XX-<slug>/
  interactive-lab/
    index.html
    styles.css
    js/app.js
    assets/
```

## Continue Development

ผู้พัฒนาคนถัดไปควรอ่านตามลำดับ:

1. `CLAUDE.md`
2. `HANDOFF.md`
3. `NEXT_STEPS.md`

งานถัดไปที่แนะนำคือ Clicker Phase 2A: สร้างคลังคำถาม local ครบ 62 ข้อของ
`261111` และเพิ่มการเลือกบทบนหน้าครู ก่อนเริ่ม Supabase production transport

## Verification

รัน `python verify_project.py` ก่อนและหลังแก้งานสำคัญ ตัวตรวจครอบคลุมจำนวนบท,
asset references, shared cache version, โครง HTML, Bloom metadata, ตัวเลือก A-E
และ baseline รูปอุปกรณ์

ควรตรวจหน้าเว็บจริงที่ desktop และ mobile width เพิ่มเติม เพราะ structural
verification ไม่ทดแทน visual QA
