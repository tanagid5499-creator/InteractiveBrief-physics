/* ============================================================================
   261112 · Lab 08 — การหาความจุไฟฟ้าและการประจุ–คายประจุของตัวเก็บประจุ (RC) · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 9):
     ความจุ  C = Q/V
     ประจุ:  V_C = V₀(1 − e^(−t/τ))  ·  คายประจุ:  V_C = V₀ e^(−t/τ)  ·  τ = RC
     ครึ่งชีวิต  t½ = 0.693 RC = 0.693 τ
     linearize (คายประจุ):  ln(V₀/V_C) = t/τ  → กราฟ ln(V₀/V_C)–t ความชัน = 1/τ (ผ่านจุดกำเนิด)
     จากความชัน → τ = 1/slope แล้ว C = τ/R   (R กรอกเป็น kΩ → C แสดงเป็น µF)
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $, $$, plotXY, slopeThroughOrigin } = B;

const STORE = "lab2-08-rc-brief-v1";
const C_REF_UF = 1000;     // ความจุระบุของตัวเก็บประจุ (µF) สำหรับเทียบร้อยละความคลาดเคลื่อน
const DEFAULTS = {
  V0: 6, Rk: 100,
  v0: 6.00, v10: 5.43, v20: 4.91, v30: 4.44, v40: 4.02,
  v50: 3.64, v60: 3.29, v70: 2.98, v80: 2.70, v90: 2.44,
};
const EXAMPLE = { V0: 6, Rk: 100, t: 50, Vc: 3.64 };

const cellNum = (el) => (el && el.value.trim() !== "" && Number.isFinite(Number(el.value)) ? Number(el.value) : NaN);
const fmt = (v, d = 3) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");
const setOut = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

function updateWorksheet() {
  const V0 = B.numberFrom("V0");
  const Rk = B.numberFrom("Rk");   // kΩ
  const pts = [];
  $$("#rcBody tr[data-row]").forEach((tr) => {
    const t = Number(tr.dataset.t);
    const Vc = cellNum($("[data-vc]", tr));
    const ln = (Number.isFinite(V0) && V0 > 0 && Number.isFinite(Vc) && Vc > 0) ? Math.log(V0 / Vc) : NaN;
    const cell = $("[data-ln]", tr);
    if (cell) cell.textContent = Number.isFinite(ln) ? fmt(ln, 3) : "—";
    if (Number.isFinite(t) && Number.isFinite(ln)) pts.push({ x: t, y: ln });
  });
  const slope = slopeThroughOrigin(pts);                       // = 1/τ (ต่อวินาที)
  const tau = Number.isFinite(slope) && slope > 0 ? 1 / slope : NaN;
  // C = τ / R ; R(kΩ)=Rk·10³ Ω → C(F)=τ/(Rk·10³) → C(µF)=τ/Rk·10³
  const capUF = (Number.isFinite(tau) && Number.isFinite(Rk) && Rk > 0) ? (tau / (Rk * 1e3)) * 1e6 : NaN;
  const err = Number.isFinite(capUF) ? (Math.abs(capUF - C_REF_UF) / C_REF_UF) * 100 : NaN;
  setOut("slopeOutput", Number.isFinite(slope) ? `${fmt(slope, 4)} ต่อวินาที` : "—");
  setOut("tauOutput", Number.isFinite(tau) ? `${fmt(tau, 1)} s` : "—");
  setOut("capOutput", Number.isFinite(capUF) ? `${fmt(capUF, 1)} µF` : "—");
  setOut("capErrOutput", Number.isFinite(err) ? `${err.toFixed(2)} %` : "—");
  plotXY($("#rcGraph"), pts, { slope, xlabel: "t (s)", ylabel: "ln(V₀/V_C)" });
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { V0, Rk, t, Vc } = EXAMPLE;
  const tau = t / Math.log(V0 / Vc);
  const capUF = (tau / (Rk * 1e3)) * 1e6;
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ: \\(V_0=${V0}\\,V,\\ R=${Rk}\\,\\text{k}\\Omega\\) อ่าน \\(V_C=${Vc}\\,V\\) ที่ \\(t=${t}\\,s\\)</p>` +
    `<div class="calc-steps">` +
    step("จากการคายประจุ ln(V₀/V_C) = t/τ", `\\ln\\dfrac{${V0}}{${Vc}}=${Math.log(V0 / Vc).toFixed(3)}`, `\\dfrac{${t}}{\\tau}`) +
    step("ค่าคงที่เวลา τ = t / ln(V₀/V_C)", `\\tau=\\dfrac{${t}}{${Math.log(V0 / Vc).toFixed(3)}}`, `${tau.toFixed(1)}\\,\\mathrm{s}`) +
    step("ความจุ C = τ / R", `C=\\dfrac{${tau.toFixed(1)}}{${Rk}\\times10^{3}}`, `${(capUF / 1e6).toExponential(2)}\\,\\mathrm{F}\\approx ${Math.round(capUF)}\\,\\mu\\mathrm{F}`) +
    `</div>` +
    `<p class="muted" style="margin:.8rem 0 0">ที่ \\(t=\\tau\\) แรงดันเหลือ \\(e^{-1}\\approx0.368\\) เท่าของ \\(V_0\\); ครึ่งชีวิต \\(t_{1/2}=0.693\\,\\tau\\)</p>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
