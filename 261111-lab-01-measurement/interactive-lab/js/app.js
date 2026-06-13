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
function poly(context, pts, fill, stroke, lw = 2) {
  context.save();
  context.beginPath();
  pts.forEach((p, i) => (i ? context.lineTo(p[0], p[1]) : context.moveTo(p[0], p[1])));
  context.closePath();
  if (fill) { context.fillStyle = fill; context.fill(); }
  if (stroke) { context.strokeStyle = stroke; context.lineWidth = lw; context.lineJoin = "round"; context.stroke(); }
  context.restore();
}

/* ── RULER simulator ──────────────────────────────────────────────────── */
function drawRuler(canvas, valueCm = 11.28, options = {}) {
  if (!canvas) return;
  const { context, width, height } = prepareCanvas(canvas);
  clear(context, width, height, C.paper);
  const pad = 42;
  const maxCm = options.maxCm || 15;
  const scaleWidth = width - pad * 2;
  const pxPerCm = scaleWidth / maxCm;
  const valueX = pad + valueCm * pxPerCm;
  const rEdge = Math.round(height * 0.30);         // ruler's measuring (top) edge
  const rH = Math.round(height * 0.52);            // ruler body fills BELOW the edge

  // ── steel ruler body (below the measuring edge) ──
  const steel = context.createLinearGradient(0, rEdge, 0, rEdge + rH);
  steel.addColorStop(0, "#fbfcff"); steel.addColorStop(1, "#e6eef9");
  roundedRect(context, pad - 18, rEdge, scaleWidth + 36, rH, 7, steel, C.line);
  line(context, pad - 12, rEdge + 1.5, pad + scaleWidth + 12, rEdge + 1.5, "rgba(255,255,255,.9)", 1);
  line(context, pad - 12, rEdge + rH - 1.5, pad + scaleWidth + 12, rEdge + rH - 1.5, "rgba(37,99,235,.12)", 1);

  // ── graduations etched DOWN from the measuring edge (numbers on the face) ──
  for (let mm = 0; mm <= maxCm * 10; mm += 1) {
    const x = pad + (mm / 10) * pxPerCm;
    const isCm = mm % 10 === 0, isHalf = mm % 5 === 0;
    const len = isCm ? 26 : isHalf ? 17 : 10;
    line(context, x, rEdge, x, rEdge + len, C.ink, isCm ? 1.2 : 0.7);
    if (isCm) text(context, String(mm / 10), x, rEdge + len + 12, { size: 12, color: C.muted });
  }

  // ── measured rod resting ON the ruler's top edge (0 → value) ──
  const rodH = 18, rodTop = rEdge - rodH;
  const rod = context.createLinearGradient(0, rodTop, 0, rodTop + rodH);
  rod.addColorStop(0, "#a7c6f6"); rod.addColorStop(.5, "#2f6fe0"); rod.addColorStop(1, "#1d4fd0");
  roundedRect(context, pad, rodTop, Math.max(rodH, valueX - pad), rodH, rodH / 2, rod, "#173fa6");
  if (valueX - pad > 16) line(context, pad + 7, rodTop + 5, valueX - 7, rodTop + 5, "rgba(255,255,255,.5)", 2);

  // ── length read off the TOP: a drafting dimension line + label above the rod ──
  const dimY = rodTop - 16;
  line(context, pad, dimY, valueX, dimY, C.mark, 1.5);
  line(context, pad, dimY - 5, pad, dimY + 5, C.mark, 1.5);          // left end tick
  line(context, valueX, dimY - 5, valueX, dimY + 5, C.mark, 1.5);    // right end tick
  context.save(); context.setLineDash([5, 4]);                        // drop a guide through the scale (where you read)
  line(context, valueX, dimY, valueX, rEdge + 30, C.mark, 1.4);
  context.restore();
  const labX = Math.min(Math.max((pad + valueX) / 2, 78), width - 78);
  text(context, `ความยาว = ${valueCm.toFixed(2)} cm`, labX, dimY - 12, { size: 14, weight: "800", color: C.mark });

  text(context, `${(valueCm * 10).toFixed(1)} mm`, Math.min(Math.max(valueX, 40), width - 40), rEdge + rH + 14, { size: 12, color: C.muted });
  text(context, "ขีดย่อยเล็กสุด = 0.1 cm · ประมาณเพิ่มอีกหนึ่งหลัก", width / 2, height - 8, { size: 11, color: C.muted });
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
  const pad = 38, W = width, H = height;
  const scaleWidth = W - pad * 2;
  const maxMm = 64, pxPerMm = scaleWidth / maxMm;
  const { main, vernier, fraction } = vernierParts(valueMm);
  const valueX = pad + Math.min(valueMm, maxMm) * pxPerMm;

  const readY = Math.round(H * 0.34);              // main scale (above) meets vernier (below) here
  const mainTop = Math.round(H * 0.15);
  const vernBot = Math.round(H * 0.50);
  const jawBot = Math.round(H * 0.88);

  // ── fixed beam carrying the main scale (steel) ──
  const steel = context.createLinearGradient(0, mainTop - 8, 0, readY + 8);
  steel.addColorStop(0, "#fbfcff"); steel.addColorStop(1, "#e7eef9");
  roundedRect(context, pad - 16, mainTop - 8, scaleWidth + 32, readY - mainTop + 18, 5, steel, C.line);

  // ── fixed jaw (left, measuring face at x = pad ⇒ 0 mm) ──
  poly(context, [[pad - 16, readY], [pad, readY], [pad, jawBot - 12], [pad - 6, jawBot], [pad - 16, jawBot]], "#dce6f5", C.frostLine);

  // ── measured rod clamped between the fixed jaw (0) and the slider jaw (value) ──
  if (valueX - pad > 6) {
    const rod = context.createLinearGradient(0, H * 0.60, 0, H * 0.76);
    rod.addColorStop(0, "#a7c6f6"); rod.addColorStop(1, "#1d4fd0");
    roundedRect(context, pad, Math.round(H * 0.62), valueX - pad, Math.round(H * 0.14), Math.round(H * 0.07), rod, "#173fa6");
  }

  // ── main scale: ticks DOWN to the read line, numbers above ──
  for (let mm = 0; mm <= maxMm; mm += 1) {
    const x = pad + mm * pxPerMm;
    if (x > W - pad + 1) break;
    const ten = mm % 10 === 0, five = mm % 5 === 0;
    line(context, x, readY, x, readY - (ten ? 23 : five ? 16 : 9), C.ink, ten ? 1.3 : 0.8);
    if (ten) text(context, String(mm), x, readY - 31, { size: 12, weight: "700", color: C.text });
  }
  line(context, pad - 6, readY, W - pad + 6, readY, C.ink, 1.3);

  // ── slider assembly at the value: translucent block + lower jaw + vernier scale ──
  const vEnd = valueX + 19 * pxPerMm;
  roundedRect(context, valueX - 12, readY - 14, Math.min(W - pad + 4, vEnd + 14) - (valueX - 12), vernBot - readY + 26, 5, "rgba(37,99,235,.12)", C.frostLine);
  poly(context, [[valueX, readY], [valueX + 18, readY], [valueX + 18, jawBot - 12], [valueX + 12, jawBot], [valueX, jawBot]], "#dce6f5", C.frostLine);
  roundedRect(context, valueX + 22, readY - 8, 12, 12, 3, "#fff", C.frostLine);   // thumb screw

  // ── vernier scale: ticks UP to the read line; the aligned tick is the reading ──
  for (let i = 0; i <= 20; i += 1) {
    const x = valueX + i * 0.95 * pxPerMm;
    if (x > W - pad + 1) break;
    const five = i % 5 === 0, hit = i === vernier;
    line(context, x, readY, x, readY + (five ? 21 : 13), hit ? C.mark : C.accent, hit ? 2.6 : (five ? 1.3 : 0.8));
    if (five) text(context, String(i), x, readY + 32, { size: 11, weight: hit ? "800" : "600", color: hit ? C.mark : C.accent });
  }

  // ── vernier-0 reading line up through the main scale ──
  line(context, valueX, mainTop - 4, valueX, readY + 23, C.mark, 1.6);
  text(context, `อ่านค่า: สเกลหลัก ${main} + เวอร์เนียร์ ${fraction.toFixed(2)} = ${valueMm.toFixed(2)} mm`, W / 2, H - 9, { size: 12, weight: "700", color: C.text });
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
  const W = width, H = height;
  const { sleeve, thimble, thimbleDivisions } = micrometerParts(valueMm);
  const axisY = Math.round(H * 0.37);

  // ── C-frame: a thick light-steel U joining the anvil to the barrel ──
  context.save();
  context.strokeStyle = "#c4d6f2"; context.lineWidth = Math.max(14, Math.round(H * 0.075));
  context.lineCap = "round"; context.lineJoin = "round";
  context.beginPath();
  context.moveTo(W * 0.15, axisY - 2); context.lineTo(W * 0.10, axisY - 2);
  context.lineTo(W * 0.10, H * 0.80); context.lineTo(W * 0.46, H * 0.80);
  context.lineTo(W * 0.46, axisY + 18);
  context.stroke();
  context.restore();

  // ── anvil (fixed face) · object · spindle (moving face) ──
  roundedRect(context, W * 0.13, axisY - 11, 16, 22, 4, "#dce6f5", C.frostLine);
  const objX = W * 0.13 + 16, objW = W * 0.06;
  const rod = context.createLinearGradient(0, axisY - 8, 0, axisY + 8);
  rod.addColorStop(0, "#a7c6f6"); rod.addColorStop(1, "#1d4fd0");
  roundedRect(context, objX, axisY - 8, objW, 16, 7, rod, "#173fa6");
  roundedRect(context, objX + objW, axisY - 5, W * 0.40 - (objX + objW), 10, 5, "#e6eef9", C.frostLine);

  // ── barrel/sleeve linear scale: datum line, mm above, half-mm below ──
  const barX = W * 0.40, barRight = W * 0.70, barRange = 12;
  const pxPerMmB = (barRight - barX) / barRange;
  roundedRect(context, barX, axisY - 15, barRight - barX + 8, 30, 6, "#eef3fc", C.line);
  line(context, barX + 4, axisY, barRight, axisY, C.ink, 1.4);
  for (let mm = 0; mm <= barRange; mm += 0.5) {
    const x = barX + 6 + mm * pxPerMmB;
    if (Number.isInteger(mm)) { line(context, x, axisY, x, axisY - 11, C.ink, 1.2); text(context, String(mm), x, axisY - 19, { size: 10, color: C.muted }); }
    else line(context, x, axisY, x, axisY + 11, C.ink, 1);
  }
  const thimbleEdgeX = barX + 6 + sleeve * pxPerMmB;

  // ── thimble over the barrel; its circular scale reads against the datum line ──
  const thW = W * 0.20, thX = thimbleEdgeX;
  roundedRect(context, thX, axisY - 25, thW, 50, 9, "#dbe6f6", C.frostLine);
  const spacing = 9;
  for (let k = -4; k <= 4; k += 1) {
    const d = (((thimbleDivisions + k) % 50) + 50) % 50;
    const yy = axisY - k * spacing;                       // k = 0 ⇒ the reading sits on the datum line
    if (yy < axisY - 23 || yy > axisY + 23) continue;
    const hit = k === 0, five = d % 5 === 0;
    line(context, thX + 5, yy, thX + (five ? 22 : 15), yy, hit ? C.mark : C.ink, hit ? 2.4 : 1);
    if (five) text(context, String(d), thX + 28, yy, { size: 10, align: "left", color: hit ? C.mark : C.muted, weight: hit ? "800" : "500" });
  }
  roundedRect(context, thX + thW, axisY - 9, W * 0.05, 18, 6, "#e6eef9", C.frostLine);   // ratchet

  // ── datum index line pointing to the aligned thimble division (the reading) ──
  line(context, thimbleEdgeX - 24, axisY, thimbleEdgeX + 30, axisY, C.mark, 1.6);

  text(context, `อ่านค่า: ปลอก ${sleeve.toFixed(1)} + ทิมเบิล ${thimble.toFixed(3)} = ${valueMm.toFixed(3)} mm`, W / 2, H - 9, { size: 12, weight: "700", color: C.text });
}

/* ── simulator wiring ─────────────────────────────────────────────────── */
function initSimulators() {
  // ruler
  const rCanvas = $("#rulerCanvas"), rPrev = $("#rulerPreviewCanvas"), rInput = $("#rulerValue"), rOut = $("#rulerReadout");
  const rUpdate = (v = Number(rInput?.value || 11.28)) => {
    if (rInput) rInput.value = v.toFixed(2);
    if (rOut) rOut.textContent = `${v.toFixed(2)} cm`;
    if (rCanvas) rCanvas.setAttribute("aria-label", `ไม้บรรทัดจำลอง อ่านความยาวได้ ${v.toFixed(2)} เซนติเมตร`);
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
    if (vCanvas) vCanvas.setAttribute("aria-label", `เวอร์เนียร์คาลิเปอร์จำลอง อ่านค่าได้ ${r.toFixed(2)} มิลลิเมตร`);
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
    if (mCanvas) mCanvas.setAttribute("aria-label", `ไมโครมิเตอร์จำลอง อ่านค่าได้ ${r.toFixed(3)} มิลลิเมตร`);
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
