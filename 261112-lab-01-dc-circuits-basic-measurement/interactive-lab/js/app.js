/* ============================================================================
   261112 · Lab 01 — การต่อวงจรไฟฟ้ากระแสตรงและการวัดเบื้องต้น · app.js
   อ้างอิงเอกสารต้นฉบับ:
     อนุกรม:  I คงที่ (I=I₁=I₂) · V=V₁+V₂ · R_eq = R₁+R₂
     ขนาน:   V คงที่ (V=V₁=V₂) · I=I₁+I₂ · 1/R_p = 1/R₁+1/R₂ → R_p = R₁R₂/(R₁+R₂)
     กฎของโอห์ม R = V/I (วัดด้วยมัลติมิเตอร์) เทียบกับค่าที่คำนวณจากสูตรรวม
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $ } = B;

const STORE = "lab2-01-dc-circuits-brief-v1";
const DEFAULTS = {};
const EXAMPLE = { R1: 100, R2: 220, V: 6 };

const f = (id) => { const el = document.getElementById(id); if (!el || el.value.trim() === "") return NaN; const v = Number(el.value); return Number.isFinite(v) ? v : NaN; };
const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");
const setOut = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
const pErr = (calc, meas) => (Number.isFinite(calc) && Number.isFinite(meas) && calc !== 0 ? Math.abs(meas - calc) / Math.abs(calc) * 100 : NaN);

function updateWorksheet() {
  // ── อนุกรม (series) ──
  const sR1 = f("sR1"), sR2 = f("sR2"), sV = f("sV"), sI = f("sI");
  const sReq = sR1 + sR2;
  const sRm = Number.isFinite(sV) && Number.isFinite(sI) && sI !== 0 ? sV / sI : NaN;
  setOut("sReqOutput", Number.isFinite(sReq) ? `${fmt(sReq, 1)} Ω` : "—");
  setOut("sRmOutput", Number.isFinite(sRm) ? `${fmt(sRm, 1)} Ω` : "—");
  setOut("sErrOutput", Number.isFinite(pErr(sReq, sRm)) ? `${pErr(sReq, sRm).toFixed(2)} %` : "—");

  // ── ขนาน (parallel) ──
  const pR1 = f("pR1"), pR2 = f("pR2"), pV = f("pV"), pI = f("pI");
  const pRp = Number.isFinite(pR1) && Number.isFinite(pR2) && pR1 + pR2 !== 0 ? (pR1 * pR2) / (pR1 + pR2) : NaN;
  const pRm = Number.isFinite(pV) && Number.isFinite(pI) && pI !== 0 ? pV / pI : NaN;
  setOut("pRpOutput", Number.isFinite(pRp) ? `${fmt(pRp, 1)} Ω` : "—");
  setOut("pRmOutput", Number.isFinite(pRm) ? `${fmt(pRm, 1)} Ω` : "—");
  setOut("pErrOutput", Number.isFinite(pErr(pRp, pRm)) ? `${pErr(pRp, pRm).toFixed(2)} %` : "—");
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { R1, R2, V } = EXAMPLE;
  const Rs = R1 + R2, Is = V / Rs, Rp = (R1 * R2) / (R1 + R2), Ip = V / Rp;
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ: \\(R_1=${R1}\\,\\Omega,\\ R_2=${R2}\\,\\Omega,\\ V=${V}\\,V\\)</p>` +
    `<div class="calc-steps">` +
    step("อนุกรม R = R₁+R₂", `R_s=${R1}+${R2}`, `${Rs}\\,\\Omega`) +
    step("กระแสอนุกรม I = V/R", `I=\\dfrac{${V}}{${Rs}}`, `${(Is * 1000).toFixed(1)}\\,\\mathrm{mA}`) +
    step("ขนาน R = R₁R₂/(R₁+R₂)", `R_p=\\dfrac{${R1}\\times ${R2}}{${R1 + R2}}`, `${Rp.toFixed(1)}\\,\\Omega`) +
    step("กระแสรวมขนาน I = V/R", `I=\\dfrac{${V}}{${Rp.toFixed(1)}}`, `${(Ip * 1000).toFixed(1)}\\,\\mathrm{mA}`) +
    `</div>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
