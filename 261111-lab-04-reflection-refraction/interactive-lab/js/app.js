/* ============================================================================
   261111 · Lab 04 — การสะท้อนและการหักเหของแสง · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 4) — 3 ตอน:
     ตอน 1 การสะท้อน: θ₁ = 0…80° บันทึกมุมสะท้อน θ₂ (ตรวจ θ₁ = θ₂)
     ตอน 2 การหักเห:  θ₁ = 0…80° บันทึกมุมหักเห θ₂ · กราฟ sinθ₁(Y)–sinθ₂(X) ความชัน = n
     ตอน 3 มุมวิกฤต:  วัด θc 3 ครั้ง · n = 1/sinθc · เฉลี่ย
     เทียบ n(กราฟ) กับ n(มุมวิกฤต) ด้วยร้อยละความแตกต่าง · อากาศ n₁ ≈ 1.00
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $, $$, plotXY, slopeThroughOrigin } = B;

const STORE = "lab04-reflection-refraction-brief-v1";
const DEFAULTS = {};
const EXAMPLE = { th1: 45, th2: 28, thc: 42 };
const sind = (deg) => Math.sin((deg * Math.PI) / 180);

const cellNum = (el) => (el && el.value.trim() !== "" && Number.isFinite(Number(el.value)) ? Number(el.value) : NaN);
const fmt = (v, d = 3) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");
const setOut = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
const avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN);

function updateWorksheet() {
  // ── ตอน 1 · การสะท้อน ──
  $$("#reflBody tr[data-a1]").forEach((tr) => {
    const a1 = Number(tr.dataset.a1);
    const th2 = cellNum($("[data-r2]", tr));
    $("[data-rdiff]", tr).textContent = Number.isFinite(th2) ? fmt(Math.abs(a1 - th2), 1) : "—";
  });

  // ── ตอน 2 · การหักเห ──
  const pts = [];
  $$("#refrBody tr[data-a1]").forEach((tr) => {
    const a1 = Number(tr.dataset.a1);
    const th2 = cellNum($("[data-x2]", tr));
    const s1 = sind(a1), s2 = Number.isFinite(th2) ? sind(th2) : NaN;
    const n = Number.isFinite(s2) && s2 > 0 ? s1 / s2 : NaN;
    $("[data-sin1]", tr).textContent = fmt(s1, 3);
    $("[data-sin2]", tr).textContent = Number.isFinite(s2) ? fmt(s2, 3) : "—";
    $("[data-n]", tr).textContent = fmt(n, 3);
    if (Number.isFinite(s1) && Number.isFinite(s2)) pts.push({ x: s2, y: s1 });
  });
  const nGraph = slopeThroughOrigin(pts);

  // ── ตอน 3 · มุมวิกฤต ──
  const ncrit = [];
  $$("#critBody tr[data-row]").forEach((tr) => {
    const thc = cellNum($("[data-thc]", tr));
    const sc = Number.isFinite(thc) ? sind(thc) : NaN;
    const n = Number.isFinite(sc) && sc > 0 ? 1 / sc : NaN;
    $("[data-sinc]", tr).textContent = Number.isFinite(sc) ? fmt(sc, 3) : "—";
    $("[data-ncrit]", tr).textContent = fmt(n, 3);
    if (Number.isFinite(n)) ncrit.push(n);
  });
  const nCrit = avg(ncrit);

  const pdiff = Number.isFinite(nGraph) && Number.isFinite(nCrit) && nGraph + nCrit > 0
    ? (Math.abs(nGraph - nCrit) / ((nGraph + nCrit) / 2)) * 100 : NaN;

  setOut("ngraphOutput", Number.isFinite(nGraph) ? fmt(nGraph, 3) : "—");
  setOut("ncritOutput", Number.isFinite(nCrit) ? fmt(nCrit, 3) : "—");
  setOut("pdiffOutput", Number.isFinite(pdiff) ? `${pdiff.toFixed(2)} %` : "—");
  plotXY($("#optGraph"), pts, { slope: nGraph, xlabel: "sin θ₂", ylabel: "sin θ₁" });
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { th1, th2, thc } = EXAMPLE;
  const s1 = sind(th1), s2 = sind(th2), n = s1 / s2, sc = sind(thc), nc = 1 / sc;
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ตัวอย่างค่าสมมติ: หักเห \\(\\theta_1=${th1}^\\circ,\\ \\theta_2=${th2}^\\circ\\) · มุมวิกฤต \\(\\theta_c=${thc}^\\circ\\)</p>` +
    `<div class="calc-steps">` +
    step("ดัชนีจากการหักเห", `n=\\dfrac{\\sin ${th1}^\\circ}{\\sin ${th2}^\\circ}=\\dfrac{${s1.toFixed(3)}}{${s2.toFixed(3)}}`, n.toFixed(3)) +
    step("ดัชนีจากมุมวิกฤต", `n=\\dfrac{1}{\\sin ${thc}^\\circ}=\\dfrac{1}{${sc.toFixed(3)}}`, nc.toFixed(3)) +
    `</div>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
