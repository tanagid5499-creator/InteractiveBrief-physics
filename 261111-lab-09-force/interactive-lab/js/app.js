/* ============================================================================
   261111 · Lab 09 — แรง · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 9) — สถิตศาสตร์ 2 ตอน:
     ตอน 1 องค์ประกอบของแรง (โต๊ะแรง): Fx = F cosθ, Fy = F sinθ
            เทียบกับองค์ประกอบที่วัดได้ (สมดุลที่ Force ring) ด้วยร้อยละความคลาดเคลื่อน
     ตอน 2 โมเมนต์และสมดุลของแรง: M = F·d ; สมดุล m₁d₁ = m₂d₂ → ร้อยละความแตกต่าง
     ทำงานในหน่วยแรงเชิงมวล (gram-force) — g ตัดกันในการเปรียบเทียบ
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $, $$ } = B;

const STORE = "lab09-force-brief-v1";
const DEFAULTS = {};
const EXAMPLE = { F: 200, th: 30, m1: 100, d1: 20, m2: 200, d2: 10 };
const cosd = (d) => Math.cos((d * Math.PI) / 180);
const sind = (d) => Math.sin((d * Math.PI) / 180);

const cellNum = (el) => (el && el.value.trim() !== "" && Number.isFinite(Number(el.value)) ? Number(el.value) : NaN);
const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");
const setOut = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
const avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN);

function updateWorksheet() {
  // ── ตอน 1 · องค์ประกอบของแรง ──
  const ex = [], ey = [];
  $$("#fcBody tr[data-row]").forEach((tr) => {
    const F = cellNum($("[data-F]", tr)), th = cellNum($("[data-th]", tr));
    const fxm = cellNum($("[data-fxm]", tr)), fym = cellNum($("[data-fym]", tr));
    const fxc = Number.isFinite(F) && Number.isFinite(th) ? F * cosd(th) : NaN;
    const fyc = Number.isFinite(F) && Number.isFinite(th) ? F * sind(th) : NaN;
    $("[data-fxc]", tr).textContent = fmt(fxc, 1);
    $("[data-fyc]", tr).textContent = fmt(fyc, 1);
    if (Number.isFinite(fxc) && fxc > 0 && Number.isFinite(fxm)) ex.push(Math.abs(fxc - fxm) / fxc * 100);
    if (Number.isFinite(fyc) && fyc > 0 && Number.isFinite(fym)) ey.push(Math.abs(fyc - fym) / fyc * 100);
  });
  setOut("errFxOutput", ex.length ? `${avg(ex).toFixed(2)} %` : "—");
  setOut("errFyOutput", ey.length ? `${avg(ey).toFixed(2)} %` : "—");

  // ── ตอน 2 · โมเมนต์ ──
  const pds = [];
  $$("#mmBody tr[data-row]").forEach((tr) => {
    const m1 = cellNum($("[data-m1]", tr)), d1 = cellNum($("[data-d1]", tr));
    const m2 = cellNum($("[data-m2]", tr)), d2 = cellNum($("[data-d2]", tr));
    const M1 = Number.isFinite(m1) && Number.isFinite(d1) ? m1 * d1 : NaN;
    const M2 = Number.isFinite(m2) && Number.isFinite(d2) ? m2 * d2 : NaN;
    const pd = Number.isFinite(M1) && Number.isFinite(M2) && M1 + M2 > 0 ? Math.abs(M1 - M2) / ((M1 + M2) / 2) * 100 : NaN;
    $("[data-M1]", tr).textContent = fmt(M1, 0);
    $("[data-M2]", tr).textContent = fmt(M2, 0);
    $("[data-md]", tr).textContent = Number.isFinite(pd) ? `${pd.toFixed(2)} %` : "—";
    if (Number.isFinite(pd)) pds.push(pd);
  });
  setOut("mDiffOutput", pds.length ? `${avg(pds).toFixed(2)} %` : "—");
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { F, th, m1, d1, m2, d2 } = EXAMPLE;
  const fx = F * cosd(th), fy = F * sind(th), M1 = m1 * d1, M2 = m2 * d2;
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ — แรง \\(F=${F}\\,g,\\ \\theta=${th}^\\circ\\) · คาน \\(m_1=${m1}\\,g\\) ที่ \\(d_1=${d1}\\,cm\\), \\(m_2=${m2}\\,g\\) ที่ \\(d_2=${d2}\\,cm\\)</p>` +
    `<div class="calc-steps">` +
    step("องค์ประกอบ Fx = F cosθ", `F_x=${F}\\cos ${th}^\\circ`, `${fx.toFixed(1)}\\,g`) +
    step("องค์ประกอบ Fy = F sinθ", `F_y=${F}\\sin ${th}^\\circ`, `${fy.toFixed(1)}\\,g`) +
    step("โมเมนต์ M₁ = m₁d₁", `M_1=${m1}\\times ${d1}`, `${M1.toFixed(0)}\\,g\\cdot cm`) +
    step("โมเมนต์ M₂ = m₂d₂", `M_2=${m2}\\times ${d2}`, `${M2.toFixed(0)}\\,g\\cdot cm`) +
    `</div>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
