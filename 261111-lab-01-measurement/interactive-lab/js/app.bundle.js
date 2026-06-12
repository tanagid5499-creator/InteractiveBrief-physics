(() => {
  // js/briefing.js
  var sectionSelector = ".article-section";
  var points = [];
  var sections = [];
  var currentPoint = -1;
  var currentSectionIndex = 0;
  function updateProgress() {
    const total = points.length;
    const completed = Math.max(0, currentPoint + 1);
    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");
    if (progressText) progressText.textContent = `${completed} / ${total}`;
    if (progressFill) progressFill.style.width = total ? `${completed / total * 100}%` : "0";
  }
  function setCurrentPoint(index) {
    if (!points.length) return;
    currentPoint = Math.max(0, Math.min(index, points.length - 1));
    points.forEach((point, pointIndex) => {
      point.classList.toggle("is-revealed", pointIndex <= currentPoint);
      point.classList.toggle("is-current", pointIndex === currentPoint);
    });
    points[currentPoint].scrollIntoView({ behavior: "smooth", block: "center" });
    const step = document.getElementById("currentBriefingStep");
    if (step) step.textContent = points[currentPoint].textContent.trim().slice(0, 150);
    updateProgress();
  }
  function enableTeacherMode(startAt = 0) {
    document.body.classList.add("teacher-mode");
    document.getElementById("teacherModeButton").textContent = "\u0E1B\u0E34\u0E14\u0E42\u0E2B\u0E21\u0E14\u0E19\u0E33\u0E40\u0E2A\u0E19\u0E2D";
    setCurrentPoint(startAt);
  }
  function disableTeacherMode() {
    document.body.classList.remove("teacher-mode");
    points.forEach((point) => point.classList.remove("is-revealed", "is-current"));
    currentPoint = -1;
    document.getElementById("teacherModeButton").textContent = "\u0E42\u0E2B\u0E21\u0E14\u0E19\u0E33\u0E40\u0E2A\u0E19\u0E2D";
    const step = document.getElementById("currentBriefingStep");
    if (step) step.textContent = "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E40\u0E23\u0E34\u0E48\u0E21\u0E19\u0E33\u0E40\u0E2A\u0E19\u0E2D";
    updateProgress();
  }
  function nextPoint() {
    if (!document.body.classList.contains("teacher-mode")) enableTeacherMode(0);
    else setCurrentPoint(currentPoint + 1);
  }
  function previousPoint() {
    if (!document.body.classList.contains("teacher-mode")) enableTeacherMode(0);
    else setCurrentPoint(currentPoint - 1);
  }
  function updateSectionLabels(section) {
    const label = section?.dataset.sectionTitle || "\u0E20\u0E32\u0E1E\u0E23\u0E27\u0E21";
    const current = document.getElementById("currentSectionLabel");
    const bottom = document.getElementById("bottomSectionLabel");
    if (current) current.textContent = label;
    if (bottom) bottom.textContent = label;
    document.querySelectorAll(".section-nav a").forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${section.id}`);
    });
  }
  function goToSection(delta) {
    currentSectionIndex = Math.max(0, Math.min(currentSectionIndex + delta, sections.length - 1));
    sections[currentSectionIndex]?.scrollIntoView({ behavior: "smooth", block: "start" });
    updateSectionLabels(sections[currentSectionIndex]);
  }
  function setupSectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      currentSectionIndex = sections.indexOf(visible.target);
      updateSectionLabels(visible.target);
    }, { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.25, 0.5] });
    sections.forEach((section) => observer.observe(section));
  }
  function setupToolbar() {
    document.getElementById("navToggle")?.addEventListener("click", () => {
      document.body.classList.toggle("nav-open");
    });
    document.querySelectorAll(".section-nav a").forEach((link) => {
      link.addEventListener("click", () => document.body.classList.remove("nav-open"));
    });
  }
  function setupKeys() {
    document.addEventListener("keydown", (event) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (["input", "textarea", "select"].includes(activeTag)) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextPoint();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previousPoint();
      }
      if (event.key.toLowerCase() === "f") {
        document.body.classList.toggle("focus-mode");
      }
      if (event.key.toLowerCase() === "d") {
        document.body.classList.toggle("demo-hidden");
      }
    });
  }
  function initBriefing() {
    points = Array.from(document.querySelectorAll("[data-briefing-point]"));
    sections = Array.from(document.querySelectorAll(sectionSelector));
    updateProgress();
    setupSectionObserver();
    setupToolbar();
    setupKeys();
    document.getElementById("teacherModeButton")?.addEventListener("click", () => {
      if (document.body.classList.contains("teacher-mode")) disableTeacherMode();
      else enableTeacherMode(Math.max(0, currentPoint));
    });
    document.getElementById("startBriefingButton")?.addEventListener("click", () => enableTeacherMode(0));
    document.getElementById("nextPointButton")?.addEventListener("click", nextPoint);
    document.getElementById("previousPointButton")?.addEventListener("click", previousPoint);
    document.getElementById("nextSectionButton")?.addEventListener("click", () => goToSection(1));
    document.getElementById("prevSectionButton")?.addEventListener("click", () => goToSection(-1));
  }

  // js/katex-render.js
  function renderMath(root = document.body) {
    if (!window.renderMathInElement) return;
    if (!root || root.dataset.mathRendered === "true") return;
    window.renderMathInElement(root, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
        { left: "$$", right: "$$", display: true }
      ],
      throwOnError: false,
      strict: "warn",
      trust: false,
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
    });
    root.dataset.mathRendered = "true";
  }

  // js/report.js
  function initReportActions() {
  }

  // js/simulators/base-canvas.js
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
  function clear(context, width, height, color = "#eceff4") {
    context.fillStyle = color;
    context.fillRect(0, 0, width, height);
  }
  function line(context, x1, y1, x2, y2, color = "#2e3440", width = 1) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.restore();
  }
  function text(context, value, x, y, options = {}) {
    const {
      color = "#2e3440",
      size = 13,
      weight = "500",
      align = "center",
      baseline = "middle"
    } = options;
    context.save();
    context.fillStyle = color;
    context.font = `${weight} ${size}px "TH Sarabun New", "TH SarabunPSK", "TH Sarabun", "Sarabun", sans-serif`;
    context.textAlign = align;
    context.textBaseline = baseline;
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
    if (fill) {
      context.fillStyle = fill;
      context.fill();
    }
    if (stroke) {
      context.strokeStyle = stroke;
      context.stroke();
    }
    context.restore();
  }

  // js/simulators/ruler-simulator.js
  var colors = {
    text: "#2e3440",
    muted: "#4c566a",
    line: "rgba(76, 86, 106, 0.38)",
    accent: "#5e81ac",
    frost: "#88c0d0",
    warning: "#d08770",
    paper: "#eceff4"
  };
  function drawRuler(canvas, valueCm = 11.28, options = {}) {
    if (!canvas) return;
    const { context, width, height } = prepareCanvas(canvas);
    clear(context, width, height, colors.paper);
    const pad = 36;
    const y = height * 0.52;
    const scaleWidth = width - pad * 2;
    const maxCm = options.maxCm || 15;
    const pxPerCm = scaleWidth / maxCm;
    const valueX = pad + valueCm * pxPerCm;
    roundedRect(context, pad - 14, y - 52, scaleWidth + 28, 84, 8, "#e5e9f0", "rgba(76, 86, 106, 0.28)");
    line(context, pad, y, pad + scaleWidth, y, colors.text, 1.2);
    for (let mm = 0; mm <= maxCm * 10; mm += 1) {
      const x = pad + mm / 10 * pxPerCm;
      const isCm = mm % 10 === 0;
      const isHalf = mm % 5 === 0;
      const tick = isCm ? 38 : isHalf ? 27 : 17;
      line(context, x, y, x, y - tick, colors.text, isCm ? 1.3 : 0.8);
      if (isCm) text(context, String(mm / 10), x, y + 18, { size: 12, color: colors.muted });
    }
    roundedRect(context, pad + pxPerCm * 0.35, y - 74, Math.max(12, valueX - pad - pxPerCm * 0.35), 12, 6, "rgba(94, 129, 172, 0.16)", "#5e81ac");
    line(context, valueX, y - 72, valueX, y + 28, colors.warning, 2.2);
    text(context, `${valueCm.toFixed(2)} cm`, valueX, y - 94, { size: 15, weight: "800", color: colors.accent });
    text(context, `${(valueCm * 10).toFixed(1)} mm`, valueX, y + 46, { size: 12, color: colors.muted });
    text(context, "smallest division = 0.1 cm, estimate one more digit", width / 2, height - 18, { size: 12, color: colors.muted });
  }
  function initRulerSimulator() {
    const canvas = document.getElementById("rulerCanvas");
    const preview = document.getElementById("rulerPreviewCanvas");
    const input = document.getElementById("rulerValue");
    const readout = document.getElementById("rulerReadout");
    const update = (value = Number(input?.value || 11.28)) => {
      if (input) input.value = value.toFixed(2);
      if (readout) readout.textContent = `${value.toFixed(2)} cm`;
      drawRuler(canvas, value);
    };
    drawRuler(preview, 11.28);
    update();
    input?.addEventListener("input", () => update(Number(input.value)));
    document.querySelectorAll("[data-ruler-example]").forEach((button) => {
      button.addEventListener("click", () => update(Number(button.dataset.rulerExample)));
    });
    window.addEventListener("resize", () => {
      drawRuler(preview, 11.28);
      update(Number(input?.value || 11.28));
    });
  }

  // js/simulators/vernier-simulator.js
  var colors2 = {
    text: "#2e3440",
    muted: "#4c566a",
    line: "rgba(76, 86, 106, 0.38)",
    accent: "#5e81ac",
    frost: "#88c0d0",
    warning: "#d08770",
    paper: "#eceff4"
  };
  function parts(valueMm, resolution = 0.05) {
    const main = Math.floor(valueMm);
    const vernier = Math.round((valueMm - main) / resolution);
    return { main, vernier, fraction: vernier * resolution };
  }
  function drawVernier(canvas, valueMm = 11.65) {
    if (!canvas) return;
    const { context, width, height } = prepareCanvas(canvas);
    clear(context, width, height, colors2.paper);
    const pad = 42;
    const scaleWidth = width - pad * 2;
    const y = height * 0.38;
    const maxMm = 60;
    const pxPerMm = scaleWidth / maxMm;
    const { main, vernier, fraction } = parts(valueMm);
    const zeroX = pad + valueMm * pxPerMm;
    roundedRect(context, pad - 18, y - 45, scaleWidth + 36, 72, 8, "#e5e9f0", "rgba(76, 86, 106, 0.28)");
    line(context, pad, y, pad + scaleWidth, y, colors2.text, 1.2);
    for (let mm = 0; mm <= maxMm; mm += 1) {
      const x = pad + mm * pxPerMm;
      const isTen = mm % 10 === 0;
      const isFive = mm % 5 === 0;
      line(context, x, y, x, y - (isTen ? 34 : isFive ? 24 : 15), colors2.text, isTen ? 1.2 : 0.8);
      if (isTen) text(context, String(mm), x, y + 18, { size: 12, color: colors2.muted });
    }
    const vernierY = height * 0.68;
    roundedRect(context, zeroX - 18, vernierY - 31, 20 * pxPerMm * 0.95 + 36, 62, 8, "rgba(136, 192, 208, 0.18)", "#88c0d0");
    for (let tick = 0; tick <= 20; tick += 1) {
      const x = zeroX + tick * pxPerMm * 0.95;
      const tall = tick % 5 === 0;
      line(context, x, vernierY, x, vernierY - (tall ? 26 : 16), tick === vernier ? colors2.warning : colors2.text, tick === vernier ? 2 : 0.8);
      if (tall) text(context, String(tick), x, vernierY + 17, { size: 11, color: colors2.muted });
    }
    line(context, zeroX, y - 48, zeroX, vernierY + 34, colors2.warning, 2);
    text(context, "0", zeroX, vernierY - 42, { size: 13, weight: "800", color: colors2.warning });
    text(context, `${valueMm.toFixed(2)} mm`, width / 2, 24, { size: 16, weight: "800", color: colors2.accent });
    text(context, `main scale ${main} mm + vernier ${fraction.toFixed(2)} mm`, width / 2, height - 18, { size: 12, color: colors2.muted });
  }
  function initVernierSimulator() {
    const canvas = document.getElementById("vernierCanvas");
    const input = document.getElementById("vernierValue");
    const readout = document.getElementById("vernierReadout");
    const update = (value = Number(input?.value || 11.65)) => {
      const rounded = Math.round(value / 0.05) * 0.05;
      if (input) input.value = rounded.toFixed(2);
      if (readout) readout.textContent = `${rounded.toFixed(2)} mm`;
      drawVernier(canvas, rounded);
    };
    update();
    input?.addEventListener("input", () => update(Number(input.value)));
    document.querySelectorAll("[data-vernier-example]").forEach((button) => {
      button.addEventListener("click", () => update(Number(button.dataset.vernierExample)));
    });
    window.addEventListener("resize", () => update(Number(input?.value || 11.65)));
  }

  // js/simulators/micrometer-simulator.js
  var colors3 = {
    text: "#2e3440",
    muted: "#4c566a",
    accent: "#5e81ac",
    frost: "#88c0d0",
    warning: "#d08770",
    paper: "#eceff4"
  };
  function micrometerParts(valueMm) {
    const sleeve = Math.floor(valueMm * 2) / 2;
    const thimble = valueMm - sleeve;
    const thimbleDivisions = thimble / 0.01;
    return { sleeve, thimble, thimbleDivisions };
  }
  function drawMicrometer(canvas, valueMm = 7.38) {
    if (!canvas) return;
    const { context, width, height } = prepareCanvas(canvas);
    clear(context, width, height, colors3.paper);
    const { sleeve, thimble, thimbleDivisions } = micrometerParts(valueMm);
    const cx = width / 2;
    const baseY = height * 0.52;
    roundedRect(context, 34, baseY - 58, width - 68, 112, 12, "#e5e9f0", "rgba(76, 86, 106, 0.28)");
    roundedRect(context, 58, baseY - 20, width * 0.42, 42, 8, "#eceff4", "#4c566a");
    roundedRect(context, width * 0.52, baseY - 52, width * 0.34, 104, 8, "rgba(136, 192, 208, 0.16)", "#5e81ac");
    line(context, 86, baseY, width * 0.52, baseY, colors3.text, 1.4);
    const sleeveStart = 90;
    const sleeveWidth = width * 0.38;
    const pxPerMm = sleeveWidth / 10;
    for (let mm = 0; mm <= 10; mm += 0.5) {
      const x = sleeveStart + mm * pxPerMm;
      const whole = Number.isInteger(mm);
      line(context, x, baseY, x, baseY - (whole ? 30 : 18), colors3.text, whole ? 1.2 : 0.9);
      if (whole) text(context, String(mm), x, baseY + 20, { size: 11, color: colors3.muted });
    }
    const sleeveX = sleeveStart + sleeve * pxPerMm;
    line(context, sleeveX, baseY - 44, sleeveX, baseY + 38, colors3.warning, 2);
    const thimbleX = width * 0.52;
    const thimbleW = width * 0.34;
    for (let i = 0; i <= 50; i += 5) {
      const y = baseY - 42 + i / 50 * 84;
      line(context, thimbleX + thimbleW - 42, y, thimbleX + thimbleW - (i % 10 === 0 ? 9 : 22), y, colors3.text, 1);
      if (i % 10 === 0) text(context, String(i), thimbleX + thimbleW - 52, y, { size: 11, align: "right", color: colors3.muted });
    }
    const markerY = baseY - 42 + thimbleDivisions % 50 / 50 * 84;
    line(context, thimbleX + 12, markerY, thimbleX + thimbleW - 8, markerY, colors3.warning, 2);
    text(context, `${valueMm.toFixed(3)} mm`, cx, 24, { size: 16, weight: "800", color: colors3.accent });
    text(context, `sleeve ${sleeve.toFixed(1)} mm + thimble ${thimble.toFixed(3)} mm`, cx, height - 20, { size: 12, color: colors3.muted });
  }
  function initMicrometerSimulator() {
    const canvas = document.getElementById("micrometerCanvas");
    const preview = document.getElementById("micrometerPreviewCanvas");
    const input = document.getElementById("micrometerValue");
    const readout = document.getElementById("micrometerReadout");
    const update = (value = Number(input?.value || 7.38)) => {
      const rounded = Math.round(value * 1e3) / 1e3;
      if (input) input.value = rounded.toFixed(3);
      if (readout) readout.textContent = `${rounded.toFixed(3)} mm`;
      drawMicrometer(canvas, rounded);
    };
    drawMicrometer(preview, 7.38);
    update();
    input?.addEventListener("input", () => update(Number(input.value)));
    document.querySelectorAll("[data-micrometer-example]").forEach((button) => {
      button.addEventListener("click", () => update(Number(button.dataset.micrometerExample)));
    });
    window.addEventListener("resize", () => {
      drawMicrometer(preview, 7.38);
      update(Number(input?.value || 7.38));
    });
  }

  // js/math-utils.js
  function toNumber(value) {
    if (value === null || value === void 0 || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  function average(values) {
    const numbers = values.map(toNumber).filter((value) => value !== null);
    if (!numbers.length) return null;
    return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  }
  function percentError(experimental, accepted = Math.PI) {
    const exp = toNumber(experimental);
    const acc = toNumber(accepted);
    if (exp === null || acc === null || acc === 0) return null;
    return Math.abs(exp - acc) / Math.abs(acc) * 100;
  }
  function percentDifference(a, b) {
    const first = toNumber(a);
    const second = toNumber(b);
    if (first === null || second === null) return null;
    const denominator = (Math.abs(first) + Math.abs(second)) / 2;
    if (denominator === 0) return null;
    return Math.abs(first - second) / denominator * 100;
  }
  function cylinderVolumeCm3(innerDiameterMm, outerDiameterMm, heightMm) {
    const inner = toNumber(innerDiameterMm);
    const outer = toNumber(outerDiameterMm);
    const height = toNumber(heightMm);
    if (inner === null || outer === null || height === null || outer <= inner) return null;
    const innerRadiusCm = inner / 10 / 2;
    const outerRadiusCm = outer / 10 / 2;
    const heightCm = height / 10;
    return Math.PI * heightCm * (outerRadiusCm ** 2 - innerRadiusCm ** 2);
  }
  function wireAreaMm2(diameterMm) {
    const diameter = toNumber(diameterMm);
    if (diameter === null || diameter < 0) return null;
    return Math.PI * (diameter / 2) ** 2;
  }
  function formatNumber(value, digits = 3, unit = "") {
    const number = toNumber(value);
    if (number === null) return "--";
    const suffix = unit ? ` ${unit}` : "";
    return `${number.toLocaleString("en-US", {
      maximumFractionDigits: digits,
      minimumFractionDigits: 0
    })}${suffix}`;
  }

  // js/state.js
  var STORAGE_KEY = "lab01-measurement-state-v1";
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  function clearState() {
    localStorage.removeItem(STORAGE_KEY);
  }
  function getValue(state, path, fallback = "") {
    return path.split(".").reduce((current, key) => {
      if (current && Object.prototype.hasOwnProperty.call(current, key)) {
        return current[key];
      }
      return fallback;
    }, state);
  }
  function setValue(state, path, value) {
    const parts2 = path.split(".");
    let cursor = state;
    parts2.slice(0, -1).forEach((part) => {
      if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
      cursor = cursor[part];
    });
    cursor[parts2[parts2.length - 1]] = value;
    saveState(state);
    return state;
  }

  // js/worksheet.js
  var worksheetState = {};
  function keyForInput(input, index) {
    const table = input.closest("table[data-group]");
    const row = input.closest("tr[data-row]");
    if (!table || !row) return input.dataset.store || "";
    return `tables.${table.dataset.group}.${row.dataset.row}.${index}`;
  }
  function tableInputs() {
    return Array.from(document.querySelectorAll("table[data-group] tbody tr[data-row]")).flatMap((row) => {
      return Array.from(row.querySelectorAll("input")).map((input, index) => ({ input, key: keyForInput(input, index) }));
    });
  }
  function storedInputs() {
    return Array.from(document.querySelectorAll("[data-store]")).map((input) => ({ input, key: input.dataset.store }));
  }
  function bindPersistence() {
    [...storedInputs(), ...tableInputs()].forEach(({ input, key }) => {
      input.value = getValue(worksheetState, key, "");
      input.addEventListener("input", () => {
        setValue(worksheetState, key, input.value);
        calculateWorksheet();
      });
    });
  }
  function rowValues(group, row) {
    return [0, 1, 2].map((index) => getValue(worksheetState, `tables.${group}.${row}.${index}`, ""));
  }
  function rowAverage(group, row) {
    return average(rowValues(group, row));
  }
  function updateTableAverages() {
    document.querySelectorAll("table[data-group] tbody tr[data-row]").forEach((row) => {
      const group = row.closest("table").dataset.group;
      const avg = rowAverage(group, row.dataset.row);
      const output = row.querySelector("[data-average]");
      if (output) output.textContent = formatNumber(avg, group === "micro" ? 3 : 2);
    });
  }
  function setOutput(id, value, digits = 3, unit = "") {
    const output = document.getElementById(id);
    if (output) output.textContent = formatNumber(value, digits, unit);
  }
  function calculateWorksheet() {
    updateTableAverages();
    const rulerDiameter = rowAverage("ruler", "diameter");
    const rulerCircumference = rowAverage("ruler", "circumference");
    const rulerThickness = rowAverage("ruler", "thickness");
    const rulerPi = rulerDiameter ? rulerCircumference / rulerDiameter : null;
    setOutput("rulerPiOutput", rulerPi, 4);
    setOutput("rulerErrorOutput", percentError(rulerPi), 2, "%");
    const vernierS = toNumber(getValue(worksheetState, "vernier.s"));
    const vernierN = toNumber(getValue(worksheetState, "vernier.n"));
    const vernierResolution = vernierS !== null && vernierN ? vernierS / vernierN : null;
    setOutput("vernierResolutionOutput", vernierResolution, 4, "mm");
    const inner = rowAverage("vernier", "innerDiameter");
    const outer = rowAverage("vernier", "outerDiameter");
    const height = rowAverage("vernier", "height");
    const outerCircumference = rowAverage("vernier", "outerCircumference");
    const vernierPi = outer ? outerCircumference / outer : null;
    const volume = cylinderVolumeCm3(inner, outer, height);
    const mass = toNumber(getValue(worksheetState, "vernier.mass"));
    const density = mass !== null && volume ? mass / volume : null;
    setOutput("vernierPiOutput", vernierPi, 4);
    setOutput("cylinderVolumeOutput", volume, 3, "cm\xB3");
    setOutput("densityOutput", density, 3, "g/cm\xB3");
    const microP = toNumber(getValue(worksheetState, "micro.p"));
    const microN = toNumber(getValue(worksheetState, "micro.n"));
    const microResolution = microP !== null && microN ? microP / microN : null;
    setOutput("microResolutionOutput", microResolution, 4, "mm");
    const wire = rowAverage("micro", "wire");
    const ringMicro = rowAverage("micro", "ring");
    setOutput("wireAreaOutput", wireAreaMm2(wire), 4, "mm\xB2");
    setOutput("ringDifferenceOutput", percentDifference(ringMicro, rulerThickness), 2, "%");
  }
  function resetWorksheet() {
    clearState();
    worksheetState = {};
    [...storedInputs(), ...tableInputs()].forEach(({ input }) => {
      input.value = "";
    });
    calculateWorksheet();
  }
  function initWorksheet() {
    worksheetState = loadState();
    bindPersistence();
    calculateWorksheet();
    document.getElementById("calculateButton")?.addEventListener("click", calculateWorksheet);
    document.getElementById("clearWorksheetButton")?.addEventListener("click", resetWorksheet);
    window.addEventListener("beforeunload", () => saveState(worksheetState));
  }

  // js/quiz.js
  function setQuizFeedback(quiz, selectedButton) {
    const answer = quiz.dataset.answer;
    const selected = selectedButton.dataset.quizOption;
    const isCorrect = selected === answer;
    const feedback = quiz.querySelector("[data-quiz-feedback]");
    quiz.querySelectorAll("[data-quiz-option]").forEach((button) => {
      const buttonIsAnswer = button.dataset.quizOption === answer;
      button.classList.toggle("is-correct", buttonIsAnswer && isCorrect);
      button.classList.toggle("is-incorrect", button === selectedButton && !isCorrect);
      button.setAttribute("aria-pressed", String(button === selectedButton));
    });
    quiz.classList.toggle("is-answered", true);
    quiz.classList.toggle("is-correct", isCorrect);
    if (feedback) {
      feedback.textContent = isCorrect ? "\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 \u0E43\u0E0A\u0E49\u0E2B\u0E25\u0E31\u0E01\u0E01\u0E32\u0E23\u0E2D\u0E48\u0E32\u0E19\u0E2A\u0E40\u0E01\u0E25\u0E41\u0E25\u0E30\u0E40\u0E25\u0E02\u0E19\u0E31\u0E22\u0E2A\u0E33\u0E04\u0E31\u0E0D\u0E44\u0E14\u0E49\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E2A\u0E21" : `\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48 \u0E25\u0E2D\u0E07\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E01\u0E31\u0E1A\u0E2B\u0E25\u0E31\u0E01\u0E01\u0E32\u0E23\u0E2D\u0E48\u0E32\u0E19\u0E04\u0E48\u0E32\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07 \u0E04\u0E33\u0E15\u0E2D\u0E1A\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E04\u0E37\u0E2D ${answer}`;
    }
  }
  function initQuizzes() {
    document.querySelectorAll("[data-quiz-option]").forEach((button) => {
      button.addEventListener("click", () => {
        const quiz = button.closest(".quick-quiz");
        if (!quiz) return;
        setQuizFeedback(quiz, button);
      });
    });
  }

  // js/app.js
  function renderWhenKatexReady(attempt = 0) {
    if (window.renderMathInElement) {
      renderMath(document.body);
      return;
    }
    if (attempt < 40) window.setTimeout(() => renderWhenKatexReady(attempt + 1), 100);
  }
  function init() {
    initBriefing();
    initRulerSimulator();
    initVernierSimulator();
    initMicrometerSimulator();
    initWorksheet();
    initQuizzes();
    initReportActions();
    renderWhenKatexReady();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
