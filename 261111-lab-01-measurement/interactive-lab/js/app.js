/* ============================================================================
   261111 · Lab 01 — การวัดและเครื่องมือวัดเบื้องต้น · app.js  (lab-specific module)
   ----------------------------------------------------------------------------
   Shared chrome (nav, present mode, KaTeX, store, toast, reveals, lightbox,
   ratio) lives in ../../shared/brief-core.js. This file holds Lab 01's own
   logic: the ruler/vernier/micrometer scale-reading SIMULATORS (kept from the
   original, re-tinted to the Drafting-Sheet palette), the 3 worksheet tables'
   calculations (mean · π_exp · density · wire area · % error / difference), and
   the quiz wiring — then hands off to Brief.init().
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $, $$ } = B;

/* ── Drafting-Sheet canvas palette (was Nord) ─────────────────────────── */
const C = {
  ink: "#122a4f", text: "#2b3a55", muted: "#515e78",
  line: "rgba(37,99,235,.30)", accent: "#2563eb", mark: "#d9480f",
  paper: "#ffffff", plate: "#eef3fc", frost: "rgba(37,99,235,.12)", frostLine: "#2563eb",
};
const CANVAS_FONT = '"Sarabun","TH Sarabun New","TH SarabunPSK",sans-serif';

/* ── canvas helpers (from base-canvas.js) ─────────────────────────────── */
function prepareCanvas(canvas) {
  const context = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.round(rect.width || canvas.width);
  const height = Math.round((rect.width || canvas.width) * (canvas.height / canvas.width));
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { context, width, height };
}
function clear(context, width, height, color = C.paper) {
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
}
function line(context, x1, y1, x2, y2, color = C.ink, width = 1) {
  context.save();
  context.strokeStyle = color; context.lineWidth = width;
  context.beginPath(); context.moveTo(x1, y1); context.lineTo(x2, y2); context.stroke();
  context.restore();
}
function text(context, value, x, y, options = {}) {
  const { color = C.ink, size = 13, weight = "500", align = "center", baseline = "middle" } = options;
  context.save();
  context.fillStyle = color;
  context.font = `${weight} ${size}px ${CANVAS_FONT}`;
  context.textAlign = align; context.textBaseline = baseline;
  context.fillText(value, x, y);
  context.restore();
}
function roundedRect(context, x, y, width, height, radius, fill, stroke) {
  context.save();
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  if (fill) { context.fillStyle = fill; context.fill(); }
  if (stroke) { context.strokeStyle = stroke; context.stroke(); }
  context.restore();
}

/* ── RULER simulator ──────────────────────────────────────────────────── */
function drawRuler(canvas, valueCm = 11.28, options = {}) {
  if (!canvas) return;
  const { context, width, height } = prepareCanvas(canvas);
  clear(context, width, height, C.paper);
  const pad = 36;
  const y = height * 0.52;
  const scaleWidth = width - pad * 2;
  const maxCm = options.maxCm || 15;
  const pxPerCm = scaleWidth / maxCm;
  const valueX = pad + valueCm * pxPerCm;

  roundedRect(context, pad - 14, y - 52, scaleWidth + 28, 84, 8, C.plate, C.line);
  line(context, pad, y, pad + scaleWidth, y, C.ink, 1.2);
  for (let mm = 0; mm <= maxCm * 10; mm += 1) {
    const x = pad + (mm / 10) * pxPerCm;
    const isCm = mm % 10 === 0;
    const isHalf = mm % 5 === 0;
    const tick = isCm ? 38 : isHalf ? 27 : 17;
    line(context, x, y, x, y - tick, C.ink, isCm ? 1.3 : 0.8);
    if (isCm) text(context, String(mm / 10), x, y + 18, { size: 12, color: C.muted });
  }
  roundedRect(context, pad + pxPerCm * 0.35, y - 74, Math.max(12, valueX - pad - pxPerCm * 0.35), 12, 6, C.frost, C.frostLine);
  line(context, valueX, y - 72, valueX, y + 28, C.mark, 2.2);
  text(context, `${valueCm.toFixed(2)} cm`, valueX, y - 94, { size: 15, weight: "800", color: C.accent });
  text(context, `${(valueCm * 10).toFixed(1)} mm`, valueX, y + 46, { size: 12, color: C.muted });
  text(context, "ขีดย่อยเล็กสุด = 0.1 cm · ประมาณเพิ่มอีกหนึ่งหลัก", width / 2, height - 18, { size: 12, color: C.muted });
}

/* ── VERNIER simulator ────────────────────────────────────────────────── */
function vernierParts(valueMm, resolution = 0.05) {
  const main = Math.floor(valueMm);
  const vernier = Math.round((valueMm - main) / resolution);
  return { main, vernier, fraction: vernier * resolution };
}
function drawVernier(canvas, valueMm = 11.65) {
  if (!canvas) return;
  const { context, width, height } = prepareCanvas(canvas);
  clear(context, width, height, C.paper);
  const pad = 42;
  const scaleWidth = width - pad * 2;
  const y = height * 0.38;
  const maxMm = 60;
  const pxPerMm = scaleWidth / maxMm;
  const { main, vernier, fraction } = vernierParts(valueMm);
  const zeroX = pad + valueMm * pxPerMm;

  roundedRect(context, pad - 18, y - 45, scaleWidth + 36, 72, 8, C.plate, C.line);
  line(context, pad, y, pad + scaleWidth, y, C.ink, 1.2);
  for (let mm = 0; mm <= maxMm; mm += 1) {
    const x = pad + mm * pxPerMm;
    const isTen = mm % 10 === 0;
    const isFive = mm % 5 === 0;
    line(context, x, y, x, y - (isTen ? 34 : isFive ? 24 : 15), C.ink, isTen ? 1.2 : 0.8);
    if (isTen) text(context, String(mm), x, y + 18, { size: 12, color: C.muted });
  }
  const vernierY = height * 0.68;
  roundedRect(context, zeroX - 18, vernierY - 31, 20 * pxPerMm * 0.95 + 36, 62, 8, C.frost, C.frostLine);
  for (let tick = 0; tick <= 20; tick += 1) {
    const x = zeroX + tick * pxPerMm * 0.95;
    const tall = tick % 5 === 0;
    line(context, x, vernierY, x, vernierY - (tall ? 26 : 16), tick === vernier ? C.mark : C.ink, tick === vernier ? 2 : 0.8);
    if (tall) text(context, String(tick), x, vernierY + 17, { size: 11, color: C.muted });
  }
  line(context, zeroX, y - 48, zeroX, vernierY + 34, C.mark, 2);
  text(context, "0", zeroX, vernierY - 42, { size: 13, weight: "800", color: C.mark });
  text(context, `${valueMm.toFixed(2)} mm`, width / 2, 24, { size: 16, weight: "800", color: C.accent });
  text(context, `สเกลหลัก ${main} mm + เวอร์เนียร์ ${fraction.toFixed(2)} mm`, width / 2, height - 18, { size: 12, color: C.muted });
}

/* ── MICROMETER simulator ─────────────────────────────────────────────── */
function micrometerParts(valueMm) {
  const sleeve = Math.floor(valueMm * 2) / 2;
  const thimble = valueMm - sleeve;
  const thimbleDivisions = thimble / 0.01;
  return { sleeve, thimble, thimbleDivisions };
}
function drawMicrometer(canvas, valueMm = 7.38) {
  if (!canvas) return;
  const { context, width, height } = prepareCanvas(canvas);
  clear(context, width, height, C.paper);
  const { sleeve, thimble, thimbleDivisions } = micrometerParts(valueMm);
  const cx = width / 2;
  const baseY = height * 0.52;

  roundedRect(context, 34, baseY - 58, width - 68, 112, 12, C.plate, C.line);
  roundedRect(context, 58, baseY - 20, width * 0.42, 42, 8, C.paper, C.muted);
  roundedRect(context, width * 0.52, baseY - 52, width * 0.34, 104, 8, C.frost, C.frostLine);
  line(context, 86, baseY, width * 0.52, baseY, C.ink, 1.4);

  const sleeveStart = 90;
  const sleeveWidth = width * 0.38;
  const pxPerMm = sleeveWidth / 10;
  for (let mm = 0; mm <= 10; mm += 0.5) {
    const x = sleeveStart + mm * pxPerMm;
    const whole = Number.isInteger(mm);
    line(context, x, baseY, x, baseY - (whole ? 30 : 18), C.ink, whole ? 1.2 : 0.9);
    if (whole) text(context, String(mm), x, baseY + 20, { size: 11, color: C.muted });
  }
  const sleeveX = sleeveStart + sleeve * pxPerMm;
  line(context, sleeveX, baseY - 44, sleeveX, baseY + 38, C.mark, 2);

  const thimbleX = width * 0.52;
  const thimbleW = width * 0.34;
  for (let i = 0; i <= 50; i += 5) {
    const yy = baseY - 42 + (i / 50) * 84;
    line(context, thimbleX + thimbleW - 42, yy, thimbleX + thimbleW - (i % 10 === 0 ? 9 : 22), yy, C.ink, 1);
    if (i % 10 === 0) text(context, String(i), thimbleX + thimbleW - 52, yy, { size: 11, align: "right", color: C.muted });
  }
  const markerY = baseY - 42 + ((thimbleDivisions % 50) / 50) * 84;
  line(context, thimbleX + 12, markerY, thimbleX + thimbleW - 8, markerY, C.mark, 2);
  text(context, `${valueMm.toFixed(3)} mm`, cx, 24, { size: 16, weight: "800", color: C.accent });
  text(context, `สเกลหลัก ${sleeve.toFixed(1)} mm + วงกลม ${thimble.toFixed(3)} mm`, cx, height - 20, { size: 12, color: C.muted });
}

/* ── simulator wiring ─────────────────────────────────────────────────── */
function initSimulators() {
  // ruler
  const rCanvas = $("#rulerCanvas"), rPrev = $("#rulerPreviewCanvas"), rInput = $("#rulerValue"), rOut = $("#rulerReadout");
  const rUpdate = (v = Number(rInput?.value || 11.28)) => {
    if (rInput) rInput.value = v.toFixed(2);
    if (rOut) rOut.textContent = `${v.toFixed(2)} cm`;
    drawRuler(rCanvas, v);
  };
  drawRuler(rPrev, 11.28); rUpdate();
  rInput?.addEventListener("input", () => rUpdate(Number(rInput.value)));
  $$("[data-ruler-example]").forEach((b) => b.addEventListener("click", () => rUpdate(Number(b.dataset.rulerExample))));

  // vernier
  const vCanvas = $("#vernierCanvas"), vInput = $("#vernierValue"), vOut = $("#vernierReadout");
  const vUpdate = (v = Number(vInput?.value || 11.65)) => {
    const r = Math.round(v / 0.05) * 0.05;
    if (vInput) vInput.value = r.toFixed(2);
    if (vOut) vOut.textContent = `${r.toFixed(2)} mm`;
    drawVernier(vCanvas, r);
  };
  vUpdate();
  vInput?.addEventListener("input", () => vUpdate(Number(vInput.value)));
  $$("[data-vernier-example]").forEach((b) => b.addEventListener("click", () => vUpdate(Number(b.dataset.vernierExample))));

  // micrometer
  const mCanvas = $("#micrometerCanvas"), mPrev = $("#micrometerPreviewCanvas"), mInput = $("#micrometerValue"), mOut = $("#micrometerReadout");
  const mUpdate = (v = Number(mInput?.value || 7.38)) => {
    const r = Math.round(v * 1000) / 1000;
    if (mInput) mInput.value = r.toFixed(3);
    if (mOut) mOut.textContent = `${r.toFixed(3)} mm`;
    drawMicrometer(mCanvas, r);
  };
  drawMicrometer(mPrev, 7.38); mUpdate();
  mInput?.addEventListener("input", () => mUpdate(Number(mInput.value)));
  $$("[data-micrometer-example]").forEach((b) => b.addEventListener("click", () => mUpdate(Number(b.dataset.micrometerExample))));

  window.addEventListener("resize", () => {
    drawRuler(rPrev, 11.28); rUpdate(Number(rInput?.value || 11.28));
    vUpdate(Number(vInput?.value || 11.65));
    drawMicrometer(mPrev, 7.38); mUpdate(Number(mInput?.value || 7.38));
  });
}

/* ── math helpers (from math-utils.js) ────────────────────────────────── */
const toNumber = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const average = (values) => {
  const nums = values.map(toNumber).filter((v) => v !== null);
  return nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : null;
};
const percentError = (exp, accepted = Math.PI) => {
  const e = toNumber(exp), a = toNumber(accepted);
  return e === null || a === null || a === 0 ? null : (Math.abs(e - a) / Math.abs(a)) * 100;
};
const percentDifference = (a, b) => {
  const x = toNumber(a), y = toNumber(b);
  if (x === null || y === null) return null;
  const d = (Math.abs(x) + Math.abs(y)) / 2;
  return d === 0 ? null : (Math.abs(x - y) / d) * 100;
};
const cylinderVolumeCm3 = (innerMm, outerMm, heightMm) => {
  const inner = toNumber(innerMm), outer = toNumber(outerMm), h = toNumber(heightMm);
  if (inner === null || outer === null || h === null || outer <= inner) return null;
  const ri = inner / 10 / 2, ro = outer / 10 / 2, hc = h / 10;
  return Math.PI * hc * (ro ** 2 - ri ** 2);
};
const wireAreaMm2 = (dMm) => {
  const d = toNumber(dMm);
  return d === null || d < 0 ? null : Math.PI * (d / 2) ** 2;
};
const formatNumber = (value, digits = 3, unit = "") => {
  const n = toNumber(value);
  if (n === null) return "—";
  return `${n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 })}${unit ? " " + unit : ""}`;
};

/* ── worksheet calculations (reads the table DOM live) ────────────────── */
const rowVals = (group, row) =>
  $$(`table[data-group="${group}"] tr[data-row="${row}"] td input`).map((i) => i.value);
const rowAvg = (group, row) => average(rowVals(group, row));
const fieldVal = (id) => toNumber(document.getElementById(id)?.value);
function setOut(id, value, digits = 3, unit = "") {
  const el = document.getElementById(id);
  if (el) el.textContent = formatNumber(value, digits, unit);
}

function updateWorksheet() {
  // per-row averages
  $$("table[data-group] tbody tr[data-row]").forEach((row) => {
    const group = row.closest("table").dataset.group;
    const avg = rowAvg(group, row.dataset.row);
    const cell = row.querySelector("[data-average]");
    if (cell) cell.textContent = formatNumber(avg, group === "micro" ? 3 : 2);
  });

  // 1 · ruler → π_exp
  const rDia = rowAvg("ruler", "diameter");
  const rCirc = rowAvg("ruler", "circumference");
  const rThick = rowAvg("ruler", "thickness");
  const rPi = rDia ? rCirc / rDia : null;
  setOut("rulerPiOutput", rPi, 4);
  setOut("rulerErrorOutput", percentError(rPi), 2, "%");

  // 2 · vernier → resolution, volume, density
  const vS = fieldVal("vernierS"), vN = fieldVal("vernierN");
  setOut("vernierResolutionOutput", vS !== null && vN ? vS / vN : null, 4, "mm");
  const inner = rowAvg("vernier", "innerDiameter");
  const outer = rowAvg("vernier", "outerDiameter");
  const vHeight = rowAvg("vernier", "height");
  const outerCirc = rowAvg("vernier", "outerCircumference");
  const volume = cylinderVolumeCm3(inner, outer, vHeight);
  const mass = fieldVal("vernierMass");
  setOut("vernierPiOutput", outer ? outerCirc / outer : null, 4);
  setOut("cylinderVolumeOutput", volume, 3, "cm³");
  setOut("densityOutput", mass !== null && volume ? mass / volume : null, 3, "g/cm³");

  // 3 · micrometer → resolution, wire area, ring % difference
  const mP = fieldVal("microP"), mN = fieldVal("microN");
  setOut("microResolutionOutput", mP !== null && mN ? mP / mN : null, 4, "mm");
  const wire = rowAvg("micro", "wire");
  const ringMicro = rowAvg("micro", "ring");
  setOut("wireAreaOutput", wireAreaMm2(wire), 4, "mm²");
  setOut("ringDifferenceOutput", percentDifference(ringMicro, rThick), 2, "%");
}

/* ── hand off to shared core (quizzes are auto-wired by brief-core) ────── */
B.init({
  store: "lab01-measurement-brief-v1",
  defaults: {},
  onInput: updateWorksheet,
  onReady: () => { initSimulators(); },
});
