/* ============================================================================
   261112 · Lab 02 — สภาพต้านทานไฟฟ้า (resistivity) · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 2):
     R = ρL/A  (ρ = สภาพต้านทาน, L = ความยาว, A = πr² พื้นที่หน้าตัด)
     วัดด้วยวงจรแบ่งแรงดัน: ลวด R_x = ρL_x/A อนุกรมกับ R₁, อ่าน V_o คร่อมลวด
       V_o/(V_s − V_o) = (ρ/(R₁A))·L_x   → กราฟ Y=V_o/(V_s−V_o) กับ L_x เป็นเส้นตรงผ่านจุดกำเนิด
       ความชัน = ρ/(R₁A)  →  ρ = slope · R₁ · A
   ตัวอย่าง default: ลวดนิโครม d=0.25mm, R₁=10Ω, V_s=5V → ρ≈1.10×10⁻⁶ Ω·m
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $, $$, plotXY, slopeThroughOrigin } = B;

const RHO_REF = 1.10e-6;   // นิโครม (nichrome) Ω·m — ใช้เทียบร้อยละความคลาดเคลื่อน
const STORE = "lab2-02-resistivity-brief-v1";
const DEFAULTS = {
  Vs: 5, R1: 10, d: 0.25,
  vo0: 0.92, vo1: 1.55, vo2: 2.01, vo3: 2.36, vo4: 2.64, vo5: 2.87,
};
const EXAMPLE = { slope: 2.241, R1: 10, d: 0.25 };

const cellNum = (el) => (el && el.value.trim() !== "" && Number.isFinite(Number(el.value)) ? Number(el.value) : NaN);
const fmt = (v, d = 3) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");
const setOut = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
const setHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
const areaFromD = (d_mm) => (Number.isFinite(d_mm) && d_mm > 0 ? Math.PI * Math.pow((d_mm / 1000) / 2, 2) : NaN);  // m²

function updateWorksheet() {
  const Vs = B.numberFrom("Vs");
  const R1 = B.numberFrom("R1");
  const A = areaFromD(B.numberFrom("d"));
  setHTML("aOutput", Number.isFinite(A) ? `${B.fvK(A)} m²` : "—");

  const pts = [];
  $$("#resBody tr[data-row]").forEach((tr) => {
    const L = Number(tr.dataset.l);
    const Vo = cellNum($("[data-vo]", tr));
    const Y = (Number.isFinite(Vs) && Number.isFinite(Vo) && Vo > 0 && Vs - Vo > 0) ? Vo / (Vs - Vo) : NaN;
    const cell = $("[data-y]", tr);
    if (cell) cell.textContent = Number.isFinite(Y) ? fmt(Y, 3) : "—";
    if (Number.isFinite(L) && Number.isFinite(Y)) pts.push({ x: L, y: Y });
  });
  const slope = slopeThroughOrigin(pts);                  // = ρ/(R₁A)  (ต่อเมตร)
  const rho = (Number.isFinite(slope) && Number.isFinite(R1) && Number.isFinite(A)) ? slope * R1 * A : NaN;
  const err = Number.isFinite(rho) ? (Math.abs(rho - RHO_REF) / RHO_REF) * 100 : NaN;
  setOut("slopeOutput", Number.isFinite(slope) ? `${fmt(slope, 3)} m⁻¹` : "—");
  setHTML("rhoOutput", Number.isFinite(rho) ? `${B.fvK(rho)} Ω·m` : "—");
  setOut("errOutput", Number.isFinite(err) ? `${err.toFixed(2)} %` : "—");
  plotXY($("#resGraph"), pts, { slope, xlabel: "L (m)", ylabel: "Vo / (Vs − Vo)" });
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { slope, R1, d } = EXAMPLE;
  const A = areaFromD(d);
  const rho = slope * R1 * A;
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ: ลวด \\(d=${d}\\,\\mathrm{mm}\\), \\(R_1=${R1}\\,\\Omega\\); ความชันกราฟ \\(Y\\)–\\(L\\) ได้ \\(${slope}\\,\\mathrm{m^{-1}}\\)</p>` +
    `<div class="calc-steps">` +
    step("พื้นที่หน้าตัด A = πr²", `A=\\pi\\left(\\tfrac{${d}\\times10^{-3}}{2}\\right)^2`, `${A.toExponential(3)}\\,\\mathrm{m^2}`) +
    step("ความชัน = ρ/(R₁A)", `\\text{slope}=\\dfrac{\\rho}{R_1 A}`, `${slope}\\,\\mathrm{m^{-1}}`) +
    step("สภาพต้านทาน ρ = slope·R₁·A", `\\rho=${slope}\\times ${R1}\\times ${A.toExponential(3)}`, `${rho.toExponential(3)}\\,\\Omega\\cdot\\mathrm{m}`) +
    `</div>` +
    `<p class="muted" style="margin:.8rem 0 0">เทียบค่าอ้างอิงนิโครม \\(\\rho\\approx1.10\\times10^{-6}\\,\\Omega\\cdot\\mathrm{m}\\)</p>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
