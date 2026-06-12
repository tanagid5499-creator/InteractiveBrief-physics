import { clear, line, prepareCanvas, roundedRect, text } from "./base-canvas.js";

const colors = {
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

export function drawMicrometer(canvas, valueMm = 7.38) {
  if (!canvas) return;
  const { context, width, height } = prepareCanvas(canvas);
  clear(context, width, height, colors.paper);
  const { sleeve, thimble, thimbleDivisions } = micrometerParts(valueMm);
  const cx = width / 2;
  const baseY = height * 0.52;

  roundedRect(context, 34, baseY - 58, width - 68, 112, 12, "#e5e9f0", "rgba(76, 86, 106, 0.28)");
  roundedRect(context, 58, baseY - 20, width * 0.42, 42, 8, "#eceff4", "#4c566a");
  roundedRect(context, width * 0.52, baseY - 52, width * 0.34, 104, 8, "rgba(136, 192, 208, 0.16)", "#5e81ac");
  line(context, 86, baseY, width * 0.52, baseY, colors.text, 1.4);

  const sleeveStart = 90;
  const sleeveWidth = width * 0.38;
  const pxPerMm = sleeveWidth / 10;
  for (let mm = 0; mm <= 10; mm += 0.5) {
    const x = sleeveStart + mm * pxPerMm;
    const whole = Number.isInteger(mm);
    line(context, x, baseY, x, baseY - (whole ? 30 : 18), colors.text, whole ? 1.2 : 0.9);
    if (whole) text(context, String(mm), x, baseY + 20, { size: 11, color: colors.muted });
  }
  const sleeveX = sleeveStart + sleeve * pxPerMm;
  line(context, sleeveX, baseY - 44, sleeveX, baseY + 38, colors.warning, 2);

  const thimbleX = width * 0.52;
  const thimbleW = width * 0.34;
  for (let i = 0; i <= 50; i += 5) {
    const y = baseY - 42 + (i / 50) * 84;
    line(context, thimbleX + thimbleW - 42, y, thimbleX + thimbleW - (i % 10 === 0 ? 9 : 22), y, colors.text, 1);
    if (i % 10 === 0) text(context, String(i), thimbleX + thimbleW - 52, y, { size: 11, align: "right", color: colors.muted });
  }
  const markerY = baseY - 42 + ((thimbleDivisions % 50) / 50) * 84;
  line(context, thimbleX + 12, markerY, thimbleX + thimbleW - 8, markerY, colors.warning, 2);
  text(context, `${valueMm.toFixed(3)} mm`, cx, 24, { size: 16, weight: "800", color: colors.accent });
  text(context, `sleeve ${sleeve.toFixed(1)} mm + thimble ${thimble.toFixed(3)} mm`, cx, height - 20, { size: 12, color: colors.muted });
}

export function initMicrometerSimulator() {
  const canvas = document.getElementById("micrometerCanvas");
  const preview = document.getElementById("micrometerPreviewCanvas");
  const input = document.getElementById("micrometerValue");
  const readout = document.getElementById("micrometerReadout");

  const update = (value = Number(input?.value || 7.38)) => {
    const rounded = Math.round(value * 1000) / 1000;
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
