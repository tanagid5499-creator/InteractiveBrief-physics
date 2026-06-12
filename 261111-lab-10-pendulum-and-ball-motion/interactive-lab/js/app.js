/* ============================================================================
   261111 · Lab 10 — การเคลื่อนที่ของลูกตุ้มนาฬิกาและลูกตุ้มฟิสิกัล · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 10):
     ลูกตุ้มอย่างง่าย: T = 2π√(L/g) → T² = (4π²/g)·L
       กราฟ T² (แกน Y) กับ L (แกน X) ความชัน = 4π²/g → g = 4π²/slope
       วัดเวลา 5 รอบ → T = t/5 ; L = 40,60,80,100,120 cm
     ลูกตุ้มฟิสิกัล: T = 2π√(I₀/mgd) (อธิบายในเนื้อหา)
     เทียบ g กับ 9.80 m/s²
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $, $$, plotXY, slopeThroughOrigin } = B;

const G = 9.80;
const FOUR_PI2 = 4 * Math.PI * Math.PI;
const STORE = "lab10-pendulum-brief-v1";
const DEFAULTS = {};
const EXAMPLE = { L: 1.0, t: 10.03 };  // 5 รอบ → T = 2.006 s

const cellNum = (el) => (el && el.value.trim() !== "" && Number.isFinite(Number(el.value)) ? Number(el.value) : NaN);
const fmt = (v, d = 3) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");
const setOut = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

function updateWorksheet() {
  const pts = [];
  $$("#penBody tr[data-row]").forEach((tr) => {
    const L = Number(tr.dataset.l);              // เมตร
    const t = cellNum($("[data-t]", tr));        // เวลา 5 รอบ
    const T = Number.isFinite(t) ? t / 5 : NaN;
    const T2 = Number.isFinite(T) ? T * T : NaN;
    $("[data-tp]", tr).textContent = fmt(T, 3);
    $("[data-t2]", tr).textContent = fmt(T2, 3);
    if (Number.isFinite(L) && Number.isFinite(T2)) pts.push({ x: L, y: T2 });
  });
  const slope = slopeThroughOrigin(pts);         // = 4π²/g
  const g = Number.isFinite(slope) && slope > 0 ? FOUR_PI2 / slope : NaN;
  const err = Number.isFinite(g) ? (Math.abs(g - G) / G) * 100 : NaN;
  setOut("slopeOutput", Number.isFinite(slope) ? `${fmt(slope, 3)} s²/m` : "—");
  setOut("gOutput", Number.isFinite(g) ? `${fmt(g, 2)} m/s²` : "—");
  setOut("errOutput", Number.isFinite(err) ? `${err.toFixed(2)} %` : "—");
  plotXY($("#penGraph"), pts, { slope, xlabel: "L (m)", ylabel: "T² (s²)" });
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { L, t } = EXAMPLE;
  const T = t / 5, T2 = T * T, g = FOUR_PI2 * L / T2;
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ: \\(L=${L}\\,m\\), เวลา 5 รอบ \\(t=${t}\\,s\\)</p>` +
    `<div class="calc-steps">` +
    step("คาบ T = t/5", `T=\\dfrac{${t}}{5}`, `${T.toFixed(3)}\\,\\mathrm{s}`) +
    step("กำลังสองของคาบ", `T^2=${T.toFixed(3)}^2`, `${T2.toFixed(3)}\\,\\mathrm{s^2}`) +
    step("ความเร่ง g = 4π²L/T²", `g=\\dfrac{4\\pi^2(${L})}{${T2.toFixed(3)}}`, `${g.toFixed(2)}\\,\\mathrm{m/s^2}`) +
    `</div>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
