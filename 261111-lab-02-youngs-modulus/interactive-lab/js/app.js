/* ============================================================================
   261111 · Lab 02 — Young's Modulus · app.js  (lab-specific module)
   ----------------------------------------------------------------------------
   Shared chrome (nav, present mode, KaTeX render, store, toast, reveals,
   lightbox, ratio) lives in ../../shared/brief-core.js. This file holds ONLY
   Lab 02's physics: constants, worksheet compute, σ–ε graph, dial, worked
   example, prediction — then hands off to Brief.init().

   Scientific constants / rounding kept identical to the original Lab 02 document:
     g = 9.8 m/s² · Y_ref = 1.90×10¹¹ N/m²
     A = πr² (r = d/2, d mm→m) · σ = mg/A · ε = ΔL/L₀ (mm→m) · Y = σ/ε
     Y_graph = slope through origin = Σ(εσ)/Σ(ε²) · %error = |Y_graph−Y_ref|/Y_ref×100
     numbers: 4 sig figs (3-dec scientific when |v|≥1e5 or |v|<1e-3)
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $, $$, fv, fvTex, fvK, tex, percentError, average, numberFrom, rollValue, rollPercent, REDUCED_MOTION } = B;

/* ── constants & defaults ─────────────────────────────────────────────── */
const G = 9.8;
const STORE = "lab02-youngs-modulus-brief-v1";
const DEFAULTS = { wireLength: "1.200", wireDiameter: "0.500", referenceYoung: "190000000000" };
const EXAMPLE = { mass: 1.0, length: 1.2, diameter: 0.5, extension: 0.32 };

/* ── core physics (identical to source) ───────────────────────────────── */
const radiusM     = (diameterMm) => (diameterMm / 1000) / 2;
const areaFrom    = (diameterMm) => Math.PI * radiusM(diameterMm) ** 2;
const stressFrom  = (mass, area) => (mass * G) / area;
const strainFrom  = (extMm, length) => (extMm / 1000) / length;
const youngFrom   = (stress, strain) => (strain > 0 ? stress / strain : NaN);

function slopeThroughOrigin(rows) {
  const usable = rows.filter((r) => Number.isFinite(r.stress) && Number.isFinite(r.strain) && r.strain > 0);
  const num = usable.reduce((s, r) => s + r.strain * r.stress, 0);
  const den = usable.reduce((s, r) => s + r.strain * r.strain, 0);
  return den > 0 ? num / den : NaN;
}

/* ============================================================================
   STEP-BY-STEP CALCULATION (worked example)
   ========================================================================== */
function buildSteps({ mass, length, diameter, extension }) {
  const area    = areaFrom(diameter);
  const force   = mass * G;
  const stress  = stressFrom(mass, area);
  const strain  = strainFrom(extension, length);
  const young   = youngFrom(stress, strain);
  const extM    = extension / 1000;
  const ref     = 1.9e11;
  const err     = percentError(young, ref);

  const step = (label, eqTex, eqFallback, res, sub) =>
    `<div class="calc-step"><span class="cs-label">${label}</span>` +
    `<span class="cs-eq">${tex(eqTex, eqFallback)}</span>` +
    (sub ? `<span class="cs-sub">${sub}</span>` : "") +
    `<span class="cs-res">= ${res}</span></div>`;

  const stepsHTML =
    step("พื้นที่หน้าตัด A",
         `A=\\pi r^{2}=\\pi\\left(${fvTex(radiusM(diameter))}\\right)^{2}`,
         "A = πr²", `${fvK(area)} m²`) +
    step("แรงดึง F = mg",
         `F=${fvTex(mass)}\\times ${G}`,
         "F = mg", `${fvK(force)} N`) +
    step("ความเค้น σ = F/A",
         `\\sigma=\\dfrac{${fvTex(force)}}{${fvTex(area)}}`,
         "σ = F/A", `${fvK(stress)} N/m²`) +
    step("ความเครียด ε = ΔL/L₀",
         `\\varepsilon=\\dfrac{${fvTex(extM)}\\,\\text{m}}{${fvTex(length)}\\,\\text{m}}`,
         "ε = ΔL/L₀", `${fvK(strain)}`,
         `(ΔL: ${fv(extension)} mm → m)`) +
    step("โมดูลัสของยัง Y = σ/ε",
         `Y=\\dfrac{${fvTex(stress)}}{${fvTex(strain)}}`,
         "Y = σ/ε", `${fvK(young)} N/m²`);

  const resultHTML =
    `<span class="cr-label">ค่าโมดูลัสของยัง&nbsp;${tex("Y", "Y")}</span>` +
    `<span class="cr-value">${fvK(young)} N/m²</span>` +
    (Number.isFinite(err)
      ? `<span class="cr-note" style="flex-basis:100%;opacity:.9;font-size:.86rem;margin-top:.3rem">` +
        `เทียบค่ามาตรฐาน ${tex("1.90\\times10^{11}", "1.90×10<sup>11</sup>")} N/m² · คลาดเคลื่อน ${err.toFixed(2)}%</span>`
      : "");

  return { stepsHTML, resultHTML, young };
}

/* ============================================================================
   MEASUREMENT TABLE / WORKSHEET
   ========================================================================== */
function wireSetup() {
  const length = numberFrom("wireLength");
  const diameter = numberFrom("wireDiameter");
  const reference = numberFrom("referenceYoung");
  return { length, diameter, area: areaFrom(diameter), reference };
}

function collectRows() {
  const { length, area } = wireSetup();
  return $$("tr[data-mass]").map((row) => {
    const mass = Number(row.dataset.mass);
    const extInput = $("[data-extension]", row);
    const extMm = extInput && extInput.value.trim() !== "" ? Number(extInput.value) : NaN;
    const force = mass * G;
    const stress = Number.isFinite(area) && area > 0 ? stressFrom(mass, area) : NaN;
    const strain = Number.isFinite(length) && length > 0 && extMm > 0 ? strainFrom(extMm, length) : NaN;
    const young = youngFrom(stress, strain);
    return { row, mass, extMm, force, stress, strain, young };
  });
}

/* LIVE OSCILLOSCOPE PLOT — build the frame + 5 persistent points + trend ONCE, then animate their
   geometry as data changes (CSS transitions on cx/cy/x2/y2). */
const GW = 520, GH = 320, GPAD = { left: 70, right: 26, top: 24, bottom: 52 };
let graphReady = false;
function ensureGraph() {
  const svg = $("#dataGraph");
  if (!svg || graphReady) return svg;
  let html =
    `<line class="axis" x1="${GPAD.left}" y1="${GH - GPAD.bottom}" x2="${GW - GPAD.right}" y2="${GH - GPAD.bottom}"></line>` +
    `<line class="axis" x1="${GPAD.left}" y1="${GH - GPAD.bottom}" x2="${GPAD.left}" y2="${GPAD.top}"></line>` +
    `<line class="trend" x1="${GPAD.left}" y1="${GH - GPAD.bottom}" x2="${GPAD.left}" y2="${GH - GPAD.bottom}" opacity="0"></line>`;
  for (let m = 1; m <= 5; m++)
    html += `<circle class="g-pt" data-m="${m}" cx="${GPAD.left}" cy="${GH - GPAD.bottom}" r="5" opacity="0"></circle>`;
  html +=
    `<text x="${GW / 2}" y="${GH - 12}" text-anchor="middle">ความเครียด ε</text>` +
    `<text x="18" y="${GH / 2}" text-anchor="middle" transform="rotate(-90 18 ${GH / 2})">ความเค้น σ</text>`;
  svg.innerHTML = html;
  graphReady = true;
  return svg;
}

function updateGraph(rows, slope) {
  const svg = ensureGraph();
  if (!svg) return;
  const usable = rows.filter((r) => Number.isFinite(r.stress) && Number.isFinite(r.strain) && r.strain > 0);
  const maxX = Math.max(...usable.map((r) => r.strain), 1e-6);
  const maxY = Math.max(...usable.map((r) => r.stress), Number.isFinite(slope) ? slope * maxX : 1);
  const xS = (v) => GPAD.left + (v / maxX) * (GW - GPAD.left - GPAD.right);
  const yS = (v) => GH - GPAD.bottom - (v / maxY) * (GH - GPAD.top - GPAD.bottom);

  rows.forEach((r) => {
    const c = svg.querySelector(`.g-pt[data-m="${r.mass}"]`);
    if (!c) return;
    const active = Number.isFinite(r.stress) && Number.isFinite(r.strain) && r.strain > 0;
    if (!active) { c.setAttribute("opacity", "0"); return; }
    const wasHidden = c.getAttribute("opacity") === "0";
    c.setAttribute("cx", xS(r.strain).toFixed(1));
    c.setAttribute("cy", yS(r.stress).toFixed(1));
    c.setAttribute("opacity", "1");
    if (wasHidden && !REDUCED_MOTION && c.animate)            // a freshly plotted point pops in
      c.animate([{ r: 0 }, { r: 8 }, { r: 5 }], { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" });
  });

  const tr = svg.querySelector(".trend");
  if (tr) {
    if (Number.isFinite(slope)) {
      tr.setAttribute("x2", xS(maxX).toFixed(1));
      tr.setAttribute("y2", yS(slope * maxX).toFixed(1));
      tr.setAttribute("opacity", "1");
    } else tr.setAttribute("opacity", "0");
  }
}

let summaryTimer = 0;
function rollSummary(area, avg, slope, err) {
  const apply = () => {
    rollValue($("#areaOutput"), area, "m²");
    rollValue($("#avgYoungOutput"), avg, "N/m²");
    rollValue($("#slopeYoungOutput"), slope, "N/m²");
    rollPercent($("#percentErrorOutput"), err);
  };
  if (REDUCED_MOTION) { apply(); return; }
  clearTimeout(summaryTimer);
  summaryTimer = setTimeout(apply, 170);   // let the readout settle after typing pauses
}

/* live dial gauge: needle sweeps to the largest ΔL entered (0 → full scale maps to -135° → +135°) */
const DIAL_FULLSCALE = 2.0;   // mm
function updateDial(maxExt) {
  const needle = document.getElementById("dialNeedle");
  const reading = document.getElementById("dialReading");
  const valid = Number.isFinite(maxExt) && maxExt > 0;
  const frac = valid ? Math.max(0, Math.min(1, maxExt / DIAL_FULLSCALE)) : 0;
  if (needle) needle.style.transform = `rotate(${(-135 + frac * 270).toFixed(1)}deg)`;
  if (reading) reading.textContent = valid ? `${maxExt.toFixed(2)} mm` : "— mm";
}

function updateWorksheet() {
  const setup = wireSetup();
  const rows = collectRows();

  rows.forEach((r) => {
    $("[data-force]", r.row).innerHTML  = fvK(r.force);
    $("[data-stress]", r.row).innerHTML = fvK(r.stress);
    $("[data-strain]", r.row).innerHTML = fvK(r.strain);
    $("[data-young]", r.row).innerHTML  = fvK(r.young);
  });

  const slope = slopeThroughOrigin(rows);
  const avg = average(rows.map((r) => r.young));
  const err = percentError(slope, setup.reference);

  rollSummary(setup.area, avg, slope, err);
  updateGraph(rows, slope);
  const exts = rows.map((r) => r.extMm).filter((v) => Number.isFinite(v) && v > 0);
  updateDial(exts.length ? Math.max(...exts) : NaN);
}

/* ============================================================================
   WORKED EXAMPLE
   ========================================================================== */
function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { stepsHTML, resultHTML } = buildSteps(EXAMPLE);
  body.innerHTML =
    `<div class="calc-steps">${stepsHTML}</div>` +
    `<div class="calc-result">${resultHTML}</div>`;
}

/* ============================================================================
   PREDICTION PROMPT
   ========================================================================== */
function wirePrediction() {
  const fb = $("#predictFeedback");
  $$("[data-predict]").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("[data-predict]").forEach((b) => b.classList.remove("is-selected", "is-correct"));
      const correct = btn.dataset.predict === "linear";
      btn.classList.add(correct ? "is-correct" : "is-selected");
      if (fb) {
        fb.textContent = correct
          ? "เหมาะสม — ถ้าลวดยังอยู่ในช่วงกฎของฮุก ระยะยืดจะเพิ่มเกือบเป็นสัดส่วนตรงกับแรงดึง"
          : "เก็บคำทำนายนี้ไว้ แล้วใช้กราฟ σ–ε ตรวจว่าข้อมูลจริงยังเป็นเส้นตรงหรือไม่";
      }
    });
  });
}

/* ============================================================================
   HAND OFF TO SHARED CORE
   ========================================================================== */
B.init({
  store: STORE,
  defaults: DEFAULTS,
  onInput: updateWorksheet,
  onReady: () => { renderExample(); wirePrediction(); },
});
