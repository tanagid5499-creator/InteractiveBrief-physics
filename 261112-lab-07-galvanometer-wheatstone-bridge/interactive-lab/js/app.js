/* ============================================================================
   261112 · Lab 07 — กัลวานอมิเตอร์และบริดจ์วีตสโตน · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 7):
     กัลวานอมิเตอร์ = ตัวตรวจศูนย์ (null detector) ในบริดจ์วีตสโตน
     ที่สมดุล (เข็ม = 0):  R_x / R_s = R₁ / R₂   →   เมตรบริดจ์: R_x = R_s · (L₁ / L₂)
       โดย L₂ = L_total − L₁ (ลวดสไลด์ยาวรวม L_total)
     วัดความยาวสมดุล L₁ หลายครั้ง → หา R_x เฉลี่ย
   ค่า default: ตัวต้านทานที่ต้องการวัด ≈ 150 Ω (R_s = 100 Ω, สมดุลที่ L₁ ≈ 60 cm)
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $, $$ } = B;

const R_REF = 150;   // ค่าระบุของตัวต้านทานที่ต้องการวัด (Ω) — ใช้เทียบร้อยละความคลาดเคลื่อน
const STORE = "lab2-07-wheatstone-brief-v1";
const DEFAULTS = { Rs: 100, Ltot: 100, l0: 60.0, l1: 60.2, l2: 59.8, l3: 60.1, l4: 59.9 };
const EXAMPLE = { Rs: 100, Ltot: 100, L1: 60 };

const cellNum = (el) => (el && el.value.trim() !== "" && Number.isFinite(Number(el.value)) ? Number(el.value) : NaN);
const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");
const setOut = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

function updateWorksheet() {
  const Rs = B.numberFrom("Rs");
  const Ltot = B.numberFrom("Ltot");
  const vals = [];
  $$("#wbBody tr[data-row]").forEach((tr) => {
    const L1 = cellNum($("[data-l1]", tr));
    const L2 = (Number.isFinite(Ltot) && Number.isFinite(L1)) ? Ltot - L1 : NaN;
    const Rx = (Number.isFinite(Rs) && Number.isFinite(L1) && Number.isFinite(L2) && L2 > 0) ? Rs * (L1 / L2) : NaN;
    const c2 = $("[data-l2]", tr); if (c2) c2.textContent = Number.isFinite(L2) ? fmt(L2, 1) : "—";
    const cr = $("[data-rx]", tr); if (cr) cr.textContent = Number.isFinite(Rx) ? fmt(Rx, 1) : "—";
    if (Number.isFinite(Rx)) vals.push(Rx);
  });
  const avg = B.average(vals);
  const err = Number.isFinite(avg) ? (Math.abs(avg - R_REF) / R_REF) * 100 : NaN;
  setOut("avgOutput", Number.isFinite(avg) ? `${fmt(avg, 1)} Ω` : "—");
  setOut("errOutput", Number.isFinite(err) ? `${err.toFixed(2)} %` : "—");
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { Rs, Ltot, L1 } = EXAMPLE;
  const L2 = Ltot - L1, Rx = Rs * (L1 / L2);
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ: \\(R_s=${Rs}\\,\\Omega\\), ลวดสไลด์ยาว \\(${Ltot}\\,cm\\); สมดุลที่ \\(L_1=${L1}\\,cm\\)</p>` +
    `<div class="calc-steps">` +
    step("ความยาวอีกข้าง L₂ = L−L₁", `L_2=${Ltot}-${L1}`, `${L2}\\,\\mathrm{cm}`) +
    step("ที่สมดุล R_x = R_s·(L₁/L₂)", `R_x=${Rs}\\times\\dfrac{${L1}}{${L2}}`, `${fmt(Rx, 1)}\\,\\Omega`) +
    `</div>` +
    `<p class="muted" style="margin:.8rem 0 0">เข็มกัลวานอมิเตอร์ชี้ศูนย์ = บริดจ์สมดุล จึงไม่มีกระแสผ่านกัลวานอมิเตอร์ · เทียบค่าระบุ ${R_REF} Ω</p>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
