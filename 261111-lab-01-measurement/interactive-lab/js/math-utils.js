export function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function average(values) {
  const numbers = values.map(toNumber).filter((value) => value !== null);
  if (!numbers.length) return null;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

export function percentError(experimental, accepted = Math.PI) {
  const exp = toNumber(experimental);
  const acc = toNumber(accepted);
  if (exp === null || acc === null || acc === 0) return null;
  return (Math.abs(exp - acc) / Math.abs(acc)) * 100;
}

export function percentDifference(a, b) {
  const first = toNumber(a);
  const second = toNumber(b);
  if (first === null || second === null) return null;
  const denominator = (Math.abs(first) + Math.abs(second)) / 2;
  if (denominator === 0) return null;
  return (Math.abs(first - second) / denominator) * 100;
}

export function cylinderVolumeCm3(innerDiameterMm, outerDiameterMm, heightMm) {
  const inner = toNumber(innerDiameterMm);
  const outer = toNumber(outerDiameterMm);
  const height = toNumber(heightMm);
  if (inner === null || outer === null || height === null || outer <= inner) return null;
  const innerRadiusCm = (inner / 10) / 2;
  const outerRadiusCm = (outer / 10) / 2;
  const heightCm = height / 10;
  return Math.PI * heightCm * (outerRadiusCm ** 2 - innerRadiusCm ** 2);
}

export function wireAreaMm2(diameterMm) {
  const diameter = toNumber(diameterMm);
  if (diameter === null || diameter < 0) return null;
  return Math.PI * (diameter / 2) ** 2;
}

export function formatNumber(value, digits = 3, unit = "") {
  const number = toNumber(value);
  if (number === null) return "--";
  const suffix = unit ? ` ${unit}` : "";
  return `${number.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0
  })}${suffix}`;
}
