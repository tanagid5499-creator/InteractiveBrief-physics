/* ============================================================================
   261112 · Lab 03 — สเปกตรัมของวัตถุร้อนและของอะตอมไฮโดรเจน · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 3):
     วัตถุร้อน → สเปกตรัมต่อเนื่อง · อะตอมไฮโดรเจน → สเปกตรัมเส้น (อนุกรมบาลเมอร์)
     สูตรริดเบิร์ก  1/λ = R_H (1/n₁² − 1/n₂²) ; อนุกรมบาลเมอร์ n₁ = 2
       → 1/λ = R_H (1/4 − 1/n²)  : กราฟ 1/λ กับ (1/4 − 1/n²) ความชัน = R_H (ผ่านจุดกำเนิด)
   ค่าอ้างอิง R_H ≈ 1.097×10⁷ m⁻¹ (เส้นบาลเมอร์ n=3..6: 656.3, 486.1, 434.0, 410.2 nm)
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $, $$, plotXY, slopeThroughOrigin } = B;

const R_REF = 1.097e7;   // ค่าคงที่ริดเบิร์ก (m⁻¹)
const STORE = "lab2-03-spectrum-brief-v1";
const DEFAULTS = { lam3: 656.3, lam4: 486.1, lam5: 434.0, lam6: 410.2 };
const EXAMPLE = { n: 3, lam: 656.3 };

const cellNum = (el) => (el && el.value.trim() !== "" && Number.isFinite(Number(el.value)) ? Number(el.value) : NaN);
const fmt = (v, d = 4) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");
const setOut = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
const setHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
const xOf = (n) => 0.25 - 1 / (n * n);   // 1/4 − 1/n²  (อนุกรมบาลเมอร์ n₁=2)

function updateWorksheet() {
  const pts = [];
  $$("#specBody tr[data-row]").forEach((tr) => {
    const n = Number(tr.dataset.n);
    const lamNm = cellNum($("[data-lam]", tr));
    const inv = (Number.isFinite(lamNm) && lamNm > 0) ? 1 / (lamNm * 1e-9) : NaN;   // m⁻¹
    const x = xOf(n);
    const ci = $("[data-inv]", tr); if (ci) ci.innerHTML = Number.isFinite(inv) ? B.fv(inv) : "—";
    const cx = $("[data-x]", tr); if (cx) cx.textContent = fmt(x, 4);
    if (Number.isFinite(inv)) pts.push({ x, y: inv });
  });
  const slope = slopeThroughOrigin(pts);   // = R_H
  const err = Number.isFinite(slope) ? (Math.abs(slope - R_REF) / R_REF) * 100 : NaN;
  setHTML("rhOutput", Number.isFinite(slope) ? `${B.fvK(slope)} m⁻¹` : "—");
  setOut("errOutput", Number.isFinite(err) ? `${err.toFixed(2)} %` : "—");
  plotXY($("#specGraph"), pts, { slope, xlabel: "1/4 − 1/n²", ylabel: "1/λ (m⁻¹)" });
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { n, lam } = EXAMPLE;
  const inv = 1 / (lam * 1e-9), x = xOf(n), Rh = inv / x;
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ: เส้น Hα (\\(n=${n}\\to2\\)) วัดความยาวคลื่น \\(\\lambda=${lam}\\,\\mathrm{nm}\\)</p>` +
    `<div class="calc-steps">` +
    step("เลขคลื่น 1/λ", `\\dfrac{1}{${lam}\\times10^{-9}}`, `${inv.toExponential(3)}\\,\\mathrm{m^{-1}}`) +
    step("พจน์แกน x = 1/4 − 1/n²", `\\tfrac14-\\tfrac1{${n}^2}`, `${x.toFixed(4)}`) +
    step("ค่าคงที่ริดเบิร์ก R_H = (1/λ)/(1/4−1/n²)", `R_H=\\dfrac{${inv.toExponential(3)}}{${x.toFixed(4)}}`, `${Rh.toExponential(3)}\\,\\mathrm{m^{-1}}`) +
    `</div>` +
    `<p class="muted" style="margin:.8rem 0 0">เทียบค่าอ้างอิง \\(R_H\\approx1.097\\times10^{7}\\,\\mathrm{m^{-1}}\\) (ความชันของกราฟรวมทุกเส้น)</p>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
