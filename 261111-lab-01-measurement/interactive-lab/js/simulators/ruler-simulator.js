import { clear, line, prepareCanvas, roundedRect, text } from "./base-canvas.js";

const colors = {
  text: "#2e3440",
  muted: "#4c566a",
  line: "rgba(76, 86, 106, 0.38)",
  accent: "#5e81ac",
  frost: "#88c0d0",
  warning: "#d08770",
  paper: "#ffffff"
};

export function drawRuler(canvas, valueCm = 11.28, options = {}) {
  if (!canvas) return;
  const { context, width, height } = prepareCanvas(canvas);
  clear(context, width, height, colors.paper);
  const pad = 36;
  const y = height * 0.52;
  const scaleWidth = width - pad * 2;
  const maxCm = options.maxCm || 15;
  const pxPerCm = scaleWidth / maxCm;
  const valueX = pad + valueCm * pxPerCm;

  roundedRect(context, pad - 14, y - 52, scaleWidth + 28, 84, 8, "#eceff4", "rgba(76, 86, 106, 0.28)");
  line(context, pad, y, pad + scaleWidth, y, colors.text, 1.2);

  for (let mm = 0; mm <= maxCm * 10; mm += 1) {
    const x = pad + (mm / 10) * pxPerCm;
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

export function initRulerSimulator() {
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
