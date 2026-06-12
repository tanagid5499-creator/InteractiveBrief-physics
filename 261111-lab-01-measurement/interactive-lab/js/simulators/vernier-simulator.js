import { clear, line, prepareCanvas, roundedRect, text } from "./base-canvas.js";

const colors = {
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

export function drawVernier(canvas, valueMm = 11.65) {
  if (!canvas) return;
  const { context, width, height } = prepareCanvas(canvas);
  clear(context, width, height, colors.paper);
  const pad = 42;
  const scaleWidth = width - pad * 2;
  const y = height * 0.38;
  const maxMm = 60;
  const pxPerMm = scaleWidth / maxMm;
  const { main, vernier, fraction } = parts(valueMm);
  const zeroX = pad + valueMm * pxPerMm;

  roundedRect(context, pad - 18, y - 45, scaleWidth + 36, 72, 8, "#e5e9f0", "rgba(76, 86, 106, 0.28)");
  line(context, pad, y, pad + scaleWidth, y, colors.text, 1.2);
  for (let mm = 0; mm <= maxMm; mm += 1) {
    const x = pad + mm * pxPerMm;
    const isTen = mm % 10 === 0;
    const isFive = mm % 5 === 0;
    line(context, x, y, x, y - (isTen ? 34 : isFive ? 24 : 15), colors.text, isTen ? 1.2 : 0.8);
    if (isTen) text(context, String(mm), x, y + 18, { size: 12, color: colors.muted });
  }

  const vernierY = height * 0.68;
  roundedRect(context, zeroX - 18, vernierY - 31, 20 * pxPerMm * 0.95 + 36, 62, 8, "rgba(136, 192, 208, 0.18)", "#88c0d0");
  for (let tick = 0; tick <= 20; tick += 1) {
    const x = zeroX + tick * pxPerMm * 0.95;
    const tall = tick % 5 === 0;
    line(context, x, vernierY, x, vernierY - (tall ? 26 : 16), tick === vernier ? colors.warning : colors.text, tick === vernier ? 2 : 0.8);
    if (tall) text(context, String(tick), x, vernierY + 17, { size: 11, color: colors.muted });
  }
  line(context, zeroX, y - 48, zeroX, vernierY + 34, colors.warning, 2);
  text(context, "0", zeroX, vernierY - 42, { size: 13, weight: "800", color: colors.warning });
  text(context, `${valueMm.toFixed(2)} mm`, width / 2, 24, { size: 16, weight: "800", color: colors.accent });
  text(context, `main scale ${main} mm + vernier ${fraction.toFixed(2)} mm`, width / 2, height - 18, { size: 12, color: colors.muted });
}

export function initVernierSimulator() {
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
