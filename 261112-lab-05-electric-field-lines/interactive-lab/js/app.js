/* ============================================================================
   261112 · Lab 05 — การเคลื่อนที่ของอิออนในสนามไฟฟ้า · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 5):
     สนามไฟฟ้าสม่ำเสมอระหว่างขั้ว  E = V/d
     ความเร็วลอยเลื่อนของอิออน      v_d = Δs/t
     สภาพเคลื่อนที่ได้ (mobility)    μ = v_d / E   (จาก v_d = μE)
   ใช้ KMnO₄ (อิออน MnO₄⁻ สีม่วง) บนกระดาษนำไฟฟ้า ทำให้เห็นการเคลื่อนของอิออนตามสนาม
   เป็นบทเชิงสังเกต/เขียนเส้นสนาม–เส้นสมศักย์ + เครื่องคิดเลขเชิงปริมาณ (ไม่มีกราฟความชัน)
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $ } = B;

const STORE = "lab2-05-efield-brief-v1";
const DEFAULTS = { Vapp: 200, dsep: 10, ds: 2, t: 60 };
const EXAMPLE = { Vapp: 200, dsep: 10, ds: 2, t: 60 };

const setHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

function compute(V, dsep_cm, ds_cm, t) {
  const d = dsep_cm / 100, s = ds_cm / 100;   // cm → m
  const E = (Number.isFinite(V) && d > 0) ? V / d : NaN;
  const vd = (Number.isFinite(s) && t > 0) ? s / t : NaN;
  const mu = (Number.isFinite(vd) && Number.isFinite(E) && E !== 0) ? vd / E : NaN;
  return { E, vd, mu };
}

function updateWorksheet() {
  const { E, vd, mu } = compute(B.numberFrom("Vapp"), B.numberFrom("dsep"), B.numberFrom("ds"), B.numberFrom("t"));
  setHTML("eOutput", Number.isFinite(E) ? `${B.fvK(E)} V/m` : "—");
  setHTML("vdOutput", Number.isFinite(vd) ? `${B.fvK(vd)} m/s` : "—");
  setHTML("muOutput", Number.isFinite(mu) ? `${B.fvK(mu)} m²/(V·s)` : "—");
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { Vapp, dsep, ds, t } = EXAMPLE;
  const { E, vd, mu } = compute(Vapp, dsep, ds, t);
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ: \\(V=${Vapp}\\,V\\), ระยะระหว่างขั้ว \\(d=${dsep}\\,cm\\); อิออนเคลื่อน \\(\\Delta s=${ds}\\,cm\\) ใน \\(t=${t}\\,s\\)</p>` +
    `<div class="calc-steps">` +
    step("สนามไฟฟ้า E = V/d", `E=\\dfrac{${Vapp}}{${dsep / 100}}`, `${E.toLocaleString("en-US")}\\,\\mathrm{V/m}`) +
    step("ความเร็วลอยเลื่อน v_d = Δs/t", `v_d=\\dfrac{${ds / 100}}{${t}}`, `${vd.toExponential(3)}\\,\\mathrm{m/s}`) +
    step("สภาพเคลื่อนที่ได้ μ = v_d/E", `\\mu=\\dfrac{${vd.toExponential(3)}}{${E.toLocaleString("en-US")}}`, `${mu.toExponential(3)}\\,\\mathrm{m^2/(V\\cdot s)}`) +
    `</div>` +
    `<p class="muted" style="margin:.8rem 0 0">v_d = μE: ยิ่งสนามแรง อิออนยิ่งเคลื่อนเร็ว · μ เป็นสมบัติของอิออน/ตัวกลาง</p>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
