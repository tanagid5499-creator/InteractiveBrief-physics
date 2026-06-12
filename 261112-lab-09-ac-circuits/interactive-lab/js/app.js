/* ============================================================================
   261112 · Lab 09 — วงจรไฟฟ้ากระแสสลับ (AC) · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 9):
     รีแอกแตนซ์เชิงเหนี่ยวนำ  X_L = 2πfL = ωL
     รีแอกแตนซ์เชิงประจุ       X_C = 1/(2πfC) = 1/(ωC)
     อิมพีแดนซ์ (อนุกรม RLC)  Z = √(R² + (X_L − X_C)²)
     ความถี่เรโซแนนซ์          f₀ = 1/(2π√(LC))   (เมื่อ X_L = X_C)
   หน่วยกรอก: R(Ω), L(mH), C(µF), f(Hz)
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $ } = B;

const STORE = "lab2-09-ac-brief-v1";
const DEFAULTS = { R: 1000, L: 100, C: 0.1, f: 1000 };
const EXAMPLE = { R: 1000, L: 100, C: 0.1, f: 1000 };

const setHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
const fmt = (v, d = 1) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");

function compute(R, L_mH, C_uF, f) {
  const L = L_mH / 1000, C = C_uF * 1e-6;   // mH→H, µF→F
  const w = 2 * Math.PI * f;
  const XL = (Number.isFinite(w) && Number.isFinite(L)) ? w * L : NaN;
  const XC = (Number.isFinite(w) && w !== 0 && Number.isFinite(C) && C !== 0) ? 1 / (w * C) : NaN;
  const Z = (Number.isFinite(R) && Number.isFinite(XL) && Number.isFinite(XC)) ? Math.sqrt(R * R + (XL - XC) ** 2) : NaN;
  const f0 = (L > 0 && C > 0) ? 1 / (2 * Math.PI * Math.sqrt(L * C)) : NaN;
  return { XL, XC, Z, f0 };
}

function updateWorksheet() {
  const { XL, XC, Z, f0 } = compute(B.numberFrom("R"), B.numberFrom("L"), B.numberFrom("C"), B.numberFrom("f"));
  setHTML("xlOutput", Number.isFinite(XL) ? `${fmt(XL, 1)} Ω` : "—");
  setHTML("xcOutput", Number.isFinite(XC) ? `${fmt(XC, 1)} Ω` : "—");
  setHTML("zOutput", Number.isFinite(Z) ? `${fmt(Z, 1)} Ω` : "—");
  setHTML("f0Output", Number.isFinite(f0) ? `${fmt(f0, 1)} Hz` : "—");
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { R, L, C, f } = EXAMPLE;
  const { XL, XC, Z } = compute(R, L, C, f);
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ: \\(R=${R}\\,\\Omega,\\ L=${L}\\,\\mathrm{mH},\\ C=${C}\\,\\mu\\mathrm{F},\\ f=${f}\\,\\mathrm{Hz}\\)</p>` +
    `<div class="calc-steps">` +
    step("รีแอกแตนซ์เหนี่ยวนำ X_L = 2πfL", `X_L=2\\pi(${f})(${L / 1000})`, `${fmt(XL, 1)}\\,\\Omega`) +
    step("รีแอกแตนซ์ประจุ X_C = 1/(2πfC)", `X_C=\\dfrac{1}{2\\pi(${f})(${C}\\times10^{-6})}`, `${fmt(XC, 1)}\\,\\Omega`) +
    step("อิมพีแดนซ์ Z = √(R²+(X_L−X_C)²)", `Z=\\sqrt{${R}^2+(${fmt(XL, 0)}-${fmt(XC, 0)})^2}`, `${fmt(Z, 1)}\\,\\Omega`) +
    `</div>` +
    `<p class="muted" style="margin:.8rem 0 0">ที่เรโซแนนซ์ \\(X_L=X_C\\) อิมพีแดนซ์ต่ำสุด \\(Z=R\\) และกระแสสูงสุด</p>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
