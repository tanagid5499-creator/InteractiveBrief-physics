/* ============================================================================
   261111 · Lab 03 — คลื่นนิ่งในเส้นเชือก · app.js  (lab-specific module)
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 3):
     μ = M₁/L₁ · F = mg (g = 9.80) · λ = 2L/n · v = √(F/μ) · f = v/λ
     F = μ f² λ²  →  กราฟ F (แกน Y) กับ λ² (แกน X) ความชัน = μf²  →  f = √(slope/μ)
     ความถี่ส้อมเสียงไฟฟ้าอ้างอิง f₀ = 50 Hz · n = จำนวนลูป (6,5,4,3,2)
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $, $$, plotXY, slopeThroughOrigin } = B;

const G = 9.80;
const STORE = "lab03-standing-waves-brief-v1";
const DEFAULTS = { M1: "0.0006", L1: "1.200", Lvib: "0.600", fRef: "50" };
const EXAMPLE = { mu: 0.0005, L: 0.600, n: 4, m: 0.018 };

const fieldNum = (id) => { const el = document.getElementById(id); if (!el || el.value.trim() === "") return NaN; const v = Number(el.value); return Number.isFinite(v) ? v : NaN; };
const cellNum = (el) => (el && el.value.trim() !== "" && Number.isFinite(Number(el.value)) ? Number(el.value) : NaN);
const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");
const setOut = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

const getMu = () => { const M1 = fieldNum("M1"), L1 = fieldNum("L1"); return Number.isFinite(M1) && Number.isFinite(L1) && L1 > 0 ? M1 / L1 : NaN; };

function collectRows() {
  const L = fieldNum("Lvib"), mu = getMu();
  return $$("#waveBody tr[data-row]").map((tr) => {
    const n = Number(tr.dataset.n);
    const m = cellNum($("[data-m]", tr));
    const F = Number.isFinite(m) ? m * G : NaN;
    const lam = Number.isFinite(L) && n > 0 ? (2 * L) / n : NaN;
    const lam2 = Number.isFinite(lam) ? lam * lam : NaN;
    const v = Number.isFinite(F) && Number.isFinite(mu) && mu > 0 ? Math.sqrt(F / mu) : NaN;
    const f = Number.isFinite(v) && Number.isFinite(lam) && lam > 0 ? v / lam : NaN;
    return { tr, n, m, F, lam, lam2, v, f };
  });
}

function updateWorksheet() {
  const mu = getMu();
  const rows = collectRows();
  rows.forEach((r) => {
    $("[data-fcell]", r.tr).textContent = fmt(r.F, 3);
    $("[data-lam]", r.tr).textContent = fmt(r.lam, 3);
    $("[data-lam2]", r.tr).textContent = fmt(r.lam2, 4);
    $("[data-v]", r.tr).textContent = fmt(r.v, 2);
  });

  const fs = rows.map((r) => r.f).filter(Number.isFinite);
  const fAvg = fs.length ? fs.reduce((s, v) => s + v, 0) / fs.length : NaN;
  const pts = rows.filter((r) => Number.isFinite(r.lam2) && Number.isFinite(r.F)).map((r) => ({ x: r.lam2, y: r.F }));
  const slope = slopeThroughOrigin(pts);          // = μ f²
  const fGraph = Number.isFinite(slope) && slope > 0 && Number.isFinite(mu) && mu > 0 ? Math.sqrt(slope / mu) : NaN;
  const fRef = fieldNum("fRef");
  const err = Number.isFinite(fGraph) && Number.isFinite(fRef) && fRef > 0 ? (Math.abs(fGraph - fRef) / fRef) * 100 : NaN;

  setOut("muOutput", Number.isFinite(mu) ? `${mu.toLocaleString("en-US", { maximumFractionDigits: 6 })} kg/m` : "—");
  setOut("favgOutput", Number.isFinite(fAvg) ? `${fmt(fAvg, 1)} Hz` : "—");
  setOut("fgraphOutput", Number.isFinite(fGraph) ? `${fmt(fGraph, 1)} Hz` : "—");
  setOut("errOutput", Number.isFinite(err) ? `${err.toFixed(2)} %` : "—");
  plotXY($("#waveGraph"), pts, { slope, xlabel: "λ² (m²)", ylabel: "F (N)" });
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { mu, L, n, m } = EXAMPLE;
  const F = m * G, lam = (2 * L) / n, v = Math.sqrt(F / mu), f = v / lam;
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ตัวอย่างค่าสมมติ: \\(\\mu=${mu}\\,\\mathrm{kg/m}\\), \\(L=${L}\\,\\mathrm{m}\\), \\(n=${n}\\) ลูป, \\(m=${m}\\,\\mathrm{kg}\\)</p>` +
    `<div class="calc-steps">` +
    step("แรงตึง F = mg", `F=${m}\\times ${G}`, `${F.toFixed(3)}\\,\\mathrm{N}`) +
    step("ความยาวคลื่น λ = 2L/n", `\\lambda=\\dfrac{2(${L})}{${n}}`, `${lam.toFixed(3)}\\,\\mathrm{m}`) +
    step("อัตราเร็ว v = √(F/μ)", `v=\\sqrt{\\dfrac{${F.toFixed(3)}}{${mu}}}`, `${v.toFixed(2)}\\,\\mathrm{m/s}`) +
    step("ความถี่ f = v/λ", `f=\\dfrac{${v.toFixed(2)}}{${lam.toFixed(3)}}`, `${f.toFixed(1)}\\,\\mathrm{Hz}`) +
    `</div>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
