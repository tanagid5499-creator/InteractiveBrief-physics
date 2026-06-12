/* ============================================================================
   261112 · Lab 04 — การวัดรังสีและการสลายตัวของสารกัมมันตรังสี · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 5):
     กฎการสลายตัว  N = N₀e^(−λt) · ครึ่งชีวิต T½ = ln2/λ = 0.693/λ · N = N₀(½)^(t/T½)
     จำลองด้วยลูกเต๋า: คัดแต้มที่กำหนดออก โอกาส p = 1/6 ต่อครั้ง → N = N₀(5/6)^n
       ค่าคงที่สลายตัวต่อครั้ง λ = ln(6/5) ≈ 0.182 · ครึ่งชีวิตเชิงทฤษฎี T½ = 0.693/λ ≈ 3.80 ครั้ง
       linearize:  ln(N₀/N) = λ·n  → กราฟ ln(N₀/N)–n ความชัน = λ (ผ่านจุดกำเนิด)
     ตอนที่ 1: วัดอัตรานับรังสีพื้นหลัง (background) ด้วยเครื่อง GM 4 ครั้ง → หาค่าเฉลี่ย
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $, $$, plotXY, slopeThroughOrigin } = B;

const N0_DICE = 50;
const T_HALF_REF = 0.693 / Math.log(6 / 5);   // ≈ 3.80 ครั้ง (ทฤษฎี p = 1/6)
const STORE = "lab2-04-radiation-brief-v1";
const DEFAULTS = { d0: 50, d1: 42, d2: 35, d3: 29, d4: 24, d5: 20, d6: 17, d7: 14, d8: 12, d9: 10, d10: 8 };
const EXAMPLE = { n: 4 };

const cellNum = (el) => (el && el.value.trim() !== "" && Number.isFinite(Number(el.value)) ? Number(el.value) : NaN);
const fmt = (v, d = 3) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");
const setOut = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

function updateWorksheet() {
  // ── ตอนที่ 1: อัตรานับรังสีพื้นหลัง ──
  const bg = [1, 2, 3, 4].map((i) => B.numberFrom("bg" + i));
  const avg = B.average(bg);
  setOut("bgAvgOutput", Number.isFinite(avg) ? `${fmt(avg, 4)} mSv/h` : "—");
  const perYear = Number.isFinite(avg) ? avg * 24 * 365 : NaN;
  setOut("bgYearOutput", Number.isFinite(perYear) ? `${fmt(perYear, 4)} mSv/ปี` : "—");

  // ── ตอนที่ 2: จำลองการสลายตัวด้วยลูกเต๋า ──
  const row0 = $('#diceBody tr[data-n="0"]');
  const N0 = row0 ? cellNum($("[data-dice]", row0)) : NaN;
  const pts = [];
  $$("#diceBody tr[data-row]").forEach((tr) => {
    const n = Number(tr.dataset.n);
    const N = cellNum($("[data-dice]", tr));
    const ln = (Number.isFinite(N0) && N0 > 0 && Number.isFinite(N) && N > 0) ? Math.log(N0 / N) : NaN;
    const cell = $("[data-ln]", tr);
    if (cell) cell.textContent = Number.isFinite(ln) ? fmt(ln, 3) : "—";
    if (Number.isFinite(n) && Number.isFinite(ln)) pts.push({ x: n, y: ln });
  });
  const slope = slopeThroughOrigin(pts);                       // = λ ต่อครั้ง
  const tHalf = Number.isFinite(slope) && slope > 0 ? 0.693 / slope : NaN;
  const err = Number.isFinite(tHalf) ? (Math.abs(tHalf - T_HALF_REF) / T_HALF_REF) * 100 : NaN;
  setOut("lambdaOutput", Number.isFinite(slope) ? `${fmt(slope, 3)} ต่อครั้ง` : "—");
  setOut("tHalfOutput", Number.isFinite(tHalf) ? `${fmt(tHalf, 2)} ครั้ง` : "—");
  setOut("tHalfErrOutput", Number.isFinite(err) ? `${err.toFixed(2)} %` : "—");
  plotXY($("#decayGraph"), pts, { slope, xlabel: "n (จำนวนครั้งที่ทอด)", ylabel: "ln(N₀/N)" });
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const n = EXAMPLE.n;
  const N = N0_DICE * Math.pow(5 / 6, n);     // ≈ 24.1
  const Nr = Math.round(N);
  const lam = Math.log(N0_DICE / Nr) / n;
  const tHalf = 0.693 / lam;
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ: เริ่ม \\(N_0=${N0_DICE}\\) ลูก คัดแต้มที่กำหนดออก (โอกาส \\(1/6\\)) หลังทอด \\(n=${n}\\) ครั้ง</p>` +
    `<div class="calc-steps">` +
    step("คาดหมายตามทฤษฎี N = N₀(5/6)ⁿ", `N=${N0_DICE}\\left(\\tfrac{5}{6}\\right)^{${n}}`, `${N.toFixed(1)}\\approx ${Nr}\\ \\text{ลูก}`) +
    step("ค่าคงที่การสลายตัว λ = ln(N₀/N)/n", `\\lambda=\\dfrac{\\ln(${N0_DICE}/${Nr})}{${n}}`, `${lam.toFixed(3)}\\ \\text{ต่อครั้ง}`) +
    step("ครึ่งชีวิต T½ = 0.693/λ", `T_{1/2}=\\dfrac{0.693}{${lam.toFixed(3)}}`, `${tHalf.toFixed(2)}\\ \\text{ครั้ง}`) +
    `</div>` +
    `<p class="muted" style="margin:.8rem 0 0">เทียบทฤษฎี \\(\\lambda=\\ln(6/5)=0.182\\) ต่อครั้ง, \\(T_{1/2}=0.693/\\lambda\\approx3.80\\) ครั้ง</p>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
