/* ============================================================================
   261111 · Lab 05 — การแทรกสอดและการเลี้ยวเบนของแสง · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 5):
     ตอน 1 สลิตคู่ (d = 120×10⁻⁶ m): แถบสว่าง d sinθ = mλ → λ = d·y/(m·L)
            (มุมเล็ก sinθ≈y/L) · เทียบค่าจริง λ = 650 nm
     ตอน 2 สลิตเดี่ยว (λ = 650 nm): แถบมืด a sinθ = mλ → a = m·λ·L/y
            · เทียบค่าจริง a = 75 µm
   หน่วยที่ใช้: d (µm), y (mm), L (m), λ (nm), a (µm)
     λ[nm] = d[µm]·y[mm]/(m·L[m])     a[µm] = m·λ[nm]·L[m]/y[mm]
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $, $$ } = B;

const STORE = "lab05-interference-diffraction-brief-v1";
const DEFAULTS = { dSlit: "120", lamLaser: "650", aRef: "75" };
const EXAMPLE = { d: 120, L: 1.0, m: 1, y: 5.42, a_m: 1, a_L: 1.0, a_y: 8.67 };

const fieldNum = (id) => { const el = document.getElementById(id); if (!el || el.value.trim() === "") return NaN; const v = Number(el.value); return Number.isFinite(v) ? v : NaN; };
const cellNum = (el) => (el && el.value.trim() !== "" && Number.isFinite(Number(el.value)) ? Number(el.value) : NaN);
const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");
const setOut = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
const avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN);

function updateWorksheet() {
  const d = fieldNum("dSlit");        // µm
  const lam = fieldNum("lamLaser");   // nm

  // ── ตอน 1 · สลิตคู่ → λ ──
  const lams = [];
  $$("#dsBody tr[data-row]").forEach((tr) => {
    const L = cellNum($("[data-L]", tr)), m = cellNum($("[data-m]", tr)), y = cellNum($("[data-y]", tr));
    const lamCalc = Number.isFinite(d) && Number.isFinite(L) && L > 0 && Number.isFinite(m) && m !== 0 && Number.isFinite(y)
      ? (d * y) / (m * L) : NaN;     // nm
    $("[data-lam]", tr).textContent = fmt(lamCalc, 1);
    if (Number.isFinite(lamCalc)) lams.push(lamCalc);
  });
  const lamAvg = avg(lams);
  const lamErr = Number.isFinite(lamAvg) && Number.isFinite(lam) && lam > 0 ? (Math.abs(lamAvg - lam) / lam) * 100 : NaN;
  setOut("lamAvgOutput", Number.isFinite(lamAvg) ? `${fmt(lamAvg, 1)} nm` : "—");
  setOut("lamErrOutput", Number.isFinite(lamErr) ? `${lamErr.toFixed(2)} %` : "—");

  // ── ตอน 2 · สลิตเดี่ยว → a ──
  const aRef = fieldNum("aRef");
  const as = [];
  $$("#ssBody tr[data-row]").forEach((tr) => {
    const L = cellNum($("[data-L]", tr)), m = cellNum($("[data-m]", tr)), y = cellNum($("[data-y]", tr));
    const aCalc = Number.isFinite(m) && Number.isFinite(lam) && Number.isFinite(L) && Number.isFinite(y) && y > 0
      ? (m * lam * L) / y : NaN;     // µm
    $("[data-a]", tr).textContent = fmt(aCalc, 1);
    if (Number.isFinite(aCalc)) as.push(aCalc);
  });
  const aAvg = avg(as);
  const aErr = Number.isFinite(aAvg) && Number.isFinite(aRef) && aRef > 0 ? (Math.abs(aAvg - aRef) / aRef) * 100 : NaN;
  setOut("aAvgOutput", Number.isFinite(aAvg) ? `${fmt(aAvg, 1)} µm` : "—");
  setOut("aErrOutput", Number.isFinite(aErr) ? `${aErr.toFixed(2)} %` : "—");
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { d, L, m, y, a_m, a_L, a_y } = EXAMPLE;
  const lam = (d * y) / (m * L);
  const a = (a_m * 650 * a_L) / a_y;
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ — สลิตคู่: \\(d=${d}\\,\\mu m,\\ L=${L}\\,m,\\ m=${m},\\ y=${y}\\,mm\\) · สลิตเดี่ยว: \\(\\lambda=650\\,nm,\\ L=${a_L}\\,m,\\ m=${a_m},\\ y=${a_y}\\,mm\\)</p>` +
    `<div class="calc-steps">` +
    step("สลิตคู่: λ = d·y/(m·L)", `\\lambda=\\dfrac{${d}\\times ${y}}{${m}\\times ${L}}`, `${lam.toFixed(1)}\\,\\mathrm{nm}`) +
    step("สลิตเดี่ยว: a = m·λ·L/y", `a=\\dfrac{${a_m}\\times 650\\times ${a_L}}{${a_y}}`, `${a.toFixed(1)}\\,\\mu\\mathrm{m}`) +
    `</div>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
