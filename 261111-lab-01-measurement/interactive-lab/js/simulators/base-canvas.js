export function prepareCanvas(canvas) {
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

export function clear(context, width, height, color = "#eceff4") {
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
}

export function line(context, x1, y1, x2, y2, color = "#2e3440", width = 1) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.restore();
}

export function text(context, value, x, y, options = {}) {
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

export function roundedRect(context, x, y, width, height, radius, fill, stroke) {
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
