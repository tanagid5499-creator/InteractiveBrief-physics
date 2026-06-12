/* ============================================================================
   261111 · Lab 06 — ความหนาแน่นจากขวดความถ่วงจำเพาะ · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 6) — วิธีขวดถ่วงจำเพาะ (pycnometer):
     ตอน 1 ของเหลว: m₁ ขวดเปล่า · m₂ ขวด+น้ำ · m₃ ขวด+ของเหลว
            ρ = (m₃−m₁)/(m₂−m₁) · ρ_น้ำ      S = (m₃−m₁)/(m₂−m₁)
     ตอน 2 ของแข็ง: m₁ ขวดเปล่า · m₂ ขวด+ของแข็ง · m₃ ขวด+ของแข็ง+น้ำ · m₄ ขวด+น้ำ
            ρ = (m₂−m₁) / [ (m₄−m₁) − (m₃−m₂) ] · ρ_น้ำ
     ρ_น้ำ ขึ้นกับอุณหภูมิ (~0.997 g/cm³ ที่ 25°C จากตารางในเอกสาร)
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $ } = B;

const STORE = "lab06-density-brief-v1";
const DEFAULTS = { rhoW: "0.997" };
const EXAMPLE = { m1: 20, m2: 70, m3: 85, rhoW: 0.997 };

const f = (id) => { const el = document.getElementById(id); if (!el || el.value.trim() === "") return NaN; const v = Number(el.value); return Number.isFinite(v) ? v : NaN; };
const fmt = (v, d = 3) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");
const setOut = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

function updateWorksheet() {
  const rhoW = f("rhoW");

  // ── ตอน 1 · ของเหลว ──
  const m1 = f("liqM1"), m2 = f("liqM2"), m3 = f("liqM3");
  const mLiq = m3 - m1, mWat = m2 - m1;
  const sLiq = Number.isFinite(mLiq) && Number.isFinite(mWat) && mWat !== 0 ? mLiq / mWat : NaN;
  const rhoLiq = Number.isFinite(sLiq) && Number.isFinite(rhoW) ? sLiq * rhoW : NaN;
  setOut("sLiqOutput", Number.isFinite(sLiq) ? fmt(sLiq, 3) : "—");
  setOut("rhoLiqOutput", Number.isFinite(rhoLiq) ? `${fmt(rhoLiq, 3)} g/cm³` : "—");

  // ── ตอน 2 · ของแข็ง ──
  const s1 = f("solM1"), s2 = f("solM2"), s3 = f("solM3"), s4 = f("solM4");
  const mSolid = s2 - s1;
  const mDisp = (s4 - s1) - (s3 - s2);     // มวลน้ำที่ถูกแทนที่
  const sSol = Number.isFinite(mSolid) && Number.isFinite(mDisp) && mDisp !== 0 ? mSolid / mDisp : NaN;
  const rhoSol = Number.isFinite(sSol) && Number.isFinite(rhoW) ? sSol * rhoW : NaN;
  setOut("sSolOutput", Number.isFinite(sSol) ? fmt(sSol, 3) : "—");
  setOut("rhoSolOutput", Number.isFinite(rhoSol) ? `${fmt(rhoSol, 3)} g/cm³` : "—");
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { m1, m2, m3, rhoW } = EXAMPLE;
  const S = (m3 - m1) / (m2 - m1), rho = S * rhoW;
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ (ของเหลว): ขวดเปล่า \\(m_1=${m1}\\,g\\), ขวด+น้ำ \\(m_2=${m2}\\,g\\), ขวด+ของเหลว \\(m_3=${m3}\\,g\\), \\(\\rho_{น้ำ}=${rhoW}\\)</p>` +
    `<div class="calc-steps">` +
    step("ความถ่วงจำเพาะ S", `S=\\dfrac{m_3-m_1}{m_2-m_1}=\\dfrac{${m3 - m1}}{${m2 - m1}}`, S.toFixed(3)) +
    step("ความหนาแน่น ρ = S·ρ_น้ำ", `\\rho=${S.toFixed(3)}\\times ${rhoW}`, `${rho.toFixed(3)}\\,\\mathrm{g/cm^3}`) +
    `</div>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
