/* ============================================================================
   261112 · Lab 06 — สนามแม่เหล็กและแรงเคลื่อนไฟฟ้าเหนี่ยวนำ · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 6):
     สนามแม่เหล็กในโซเลนอยด์   B = μ₀ n I   (n = จำนวนรอบต่อเมตร, μ₀ = 4π×10⁻⁷)
     แรงเคลื่อนไฟฟ้าเหนี่ยวนำ   ε = N (ΔΦ/Δt)   (กฎของฟาราเดย์; ทิศตามกฎของเลนซ์)
   เป็นบทเชิงสังเกต (ทิศสนาม/กฎมือขวา, ทิศเข็มกัลวานอมิเตอร์/กฎเลนซ์) + เครื่องคิดเลขเชิงปริมาณ
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $ } = B;

const MU0 = 4 * Math.PI * 1e-7;   // T·m/A
const STORE = "lab2-06-magnetic-brief-v1";
const DEFAULTS = { n: 1000, I: 2, N: 200, dphi: 0.5, dt: 0.10 };
const EXAMPLE = { N: 200, dphi: 0.5, dt: 0.10 };

const setHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
const fmt = (v, d = 3) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");

function updateWorksheet() {
  // ── สนามแม่เหล็กของโซเลนอยด์ ──
  const n = B.numberFrom("n"), I = B.numberFrom("I");
  const Bfield = (Number.isFinite(n) && Number.isFinite(I)) ? MU0 * n * I : NaN;
  setHTML("bOutput", Number.isFinite(Bfield) ? `${B.fvK(Bfield)} T` : "—");

  // ── แรงเคลื่อนไฟฟ้าเหนี่ยวนำ (ฟาราเดย์) ──
  const N = B.numberFrom("N"), dphi = B.numberFrom("dphi"), dt = B.numberFrom("dt");
  const emf = (Number.isFinite(N) && Number.isFinite(dphi) && Number.isFinite(dt) && dt !== 0) ? N * (dphi * 1e-3) / dt : NaN;  // ΔΦ มิลลิเวเบอร์ → เวเบอร์
  setHTML("emfOutput", Number.isFinite(emf) ? `${B.fvK(emf)} V` : "—");
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { N, dphi, dt } = EXAMPLE;
  const emf = N * (dphi * 1e-3) / dt;
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ: ขดลวด \\(N=${N}\\) รอบ ฟลักซ์เปลี่ยน \\(\\Delta\\Phi=${dphi}\\,\\mathrm{mWb}\\) ใน \\(\\Delta t=${dt}\\,s\\)</p>` +
    `<div class="calc-steps">` +
    step("ฟลักซ์เป็นเวเบอร์", `\\Delta\\Phi=${dphi}\\times10^{-3}`, `${(dphi * 1e-3).toExponential(2)}\\,\\mathrm{Wb}`) +
    step("กฎฟาราเดย์ ε = N·ΔΦ/Δt", `\\varepsilon=${N}\\times\\dfrac{${(dphi * 1e-3).toExponential(2)}}{${dt}}`, `${fmt(emf, 3)}\\,\\mathrm{V}`) +
    `</div>` +
    `<p class="muted" style="margin:.8rem 0 0">ยิ่งฟลักซ์เปลี่ยนเร็ว (Δt น้อย) หรือรอบมาก (N มาก) แรงเคลื่อนยิ่งสูง · ทิศตามกฎของเลนซ์</p>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
