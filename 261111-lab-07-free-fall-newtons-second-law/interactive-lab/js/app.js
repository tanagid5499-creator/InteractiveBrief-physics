/* ============================================================================
   261111 · Lab 07 — วัตถุตกอิสระและกฎข้อที่สองของนิวตัน · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 7):
     ตอน 1 ตกอิสระ: y = ½gt²  → กราฟ y (แกน Y) กับ t² (แกน X) ความชัน = ½g → g = 2·slope
     ตอน 2 รอก (Atwood): y = ½at² → a = 2·slope ; a = ((m₁−m₂)/(m₁+m₂))·g → g = a(m₁+m₂)/(m₁−m₂)
     เทียบ g กับ 9.80 m/s²
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $, $$, plotXY, slopeThroughOrigin } = B;

const G = 9.80;
const STORE = "lab07-free-fall-brief-v1";
const DEFAULTS = { m1: "120", m2: "100" };
const EXAMPLE = { y: 1.0, t: 0.4518, m1: 120, m2: 100, h: 0.5, th: 0.5 };

const fieldNum = (id) => { const el = document.getElementById(id); if (!el || el.value.trim() === "") return NaN; const v = Number(el.value); return Number.isFinite(v) ? v : NaN; };
const cellNum = (el) => (el && el.value.trim() !== "" && Number.isFinite(Number(el.value)) ? Number(el.value) : NaN);
const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");
const setOut = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
const collect = (sel, xa, ya) => $$(sel).map((tr) => {
  const a = cellNum($(`[${xa}]`, tr)), b = cellNum($(`[${ya}]`, tr));
  return { tr, a, b };
});

function updateWorksheet() {
  // ── ตอน 1 · ตกอิสระ ──
  const ptsFF = [];
  $$("#ffBody tr[data-row]").forEach((tr) => {
    const y = cellNum($("[data-y]", tr)), t = cellNum($("[data-t]", tr));
    const t2 = Number.isFinite(t) ? t * t : NaN;
    $("[data-t2]", tr).textContent = fmt(t2, 4);
    if (Number.isFinite(y) && Number.isFinite(t2)) ptsFF.push({ x: t2, y });
  });
  const slopeFF = slopeThroughOrigin(ptsFF);
  const gFF = Number.isFinite(slopeFF) ? 2 * slopeFF : NaN;
  const errFF = Number.isFinite(gFF) ? (Math.abs(gFF - G) / G) * 100 : NaN;
  setOut("gFFOutput", Number.isFinite(gFF) ? `${fmt(gFF, 2)} m/s²` : "—");
  setOut("errFFOutput", Number.isFinite(errFF) ? `${errFF.toFixed(2)} %` : "—");
  plotXY($("#ffGraph"), ptsFF, { slope: slopeFF, xlabel: "t² (s²)", ylabel: "y (m)" });

  // ── ตอน 2 · Atwood ──
  const m1 = fieldNum("m1"), m2 = fieldNum("m2");
  const ptsAT = [];
  $$("#atBody tr[data-row]").forEach((tr) => {
    const h = cellNum($("[data-h]", tr)), t = cellNum($("[data-t]", tr));
    const t2 = Number.isFinite(t) ? t * t : NaN;
    $("[data-t2]", tr).textContent = fmt(t2, 4);
    if (Number.isFinite(h) && Number.isFinite(t2)) ptsAT.push({ x: t2, y: h });
  });
  const slopeAT = slopeThroughOrigin(ptsAT);
  const aAT = Number.isFinite(slopeAT) ? 2 * slopeAT : NaN;
  const gAT = Number.isFinite(aAT) && Number.isFinite(m1) && Number.isFinite(m2) && m1 - m2 !== 0
    ? (aAT * (m1 + m2)) / (m1 - m2) : NaN;
  const errAT = Number.isFinite(gAT) ? (Math.abs(gAT - G) / G) * 100 : NaN;
  setOut("aOutput", Number.isFinite(aAT) ? `${fmt(aAT, 3)} m/s²` : "—");
  setOut("gATOutput", Number.isFinite(gAT) ? `${fmt(gAT, 2)} m/s²` : "—");
  setOut("errATOutput", Number.isFinite(errAT) ? `${errAT.toFixed(2)} %` : "—");
  plotXY($("#atGraph"), ptsAT, { slope: slopeAT, xlabel: "t² (s²)", ylabel: "h (m)" });
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { y, t, m1, m2, h, th } = EXAMPLE;
  const gff = 2 * y / (t * t);
  const a = 2 * h / (th * th);
  const gat = a * (m1 + m2) / (m1 - m2);
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ — ตกอิสระ: \\(y=${y}\\,m,\\ t=${t}\\,s\\) · Atwood: \\(h=${h}\\,m,\\ t=${th}\\,s,\\ m_1=${m1}\\,g,\\ m_2=${m2}\\,g\\)</p>` +
    `<div class="calc-steps">` +
    step("ตกอิสระ: g = 2y/t²", `g=\\dfrac{2(${y})}{${t}^2}`, `${gff.toFixed(2)}\\,\\mathrm{m/s^2}`) +
    step("Atwood: a = 2h/t²", `a=\\dfrac{2(${h})}{${th}^2}`, `${a.toFixed(2)}\\,\\mathrm{m/s^2}`) +
    step("Atwood: g = a(m₁+m₂)/(m₁−m₂)", `g=${a.toFixed(2)}\\times\\dfrac{${m1 + m2}}{${m1 - m2}}`, `${gat.toFixed(2)}\\,\\mathrm{m/s^2}`) +
    `</div>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
