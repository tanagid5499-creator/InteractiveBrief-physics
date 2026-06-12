/* ============================================================================
   261111 · Lab 08 — สมมูลไฟฟ้า-ความร้อน · app.js
   อ้างอิงเอกสารต้นฉบับ (ปฏิบัติการที่ 8):
     พลังงานไฟฟ้า ΔW = IVt → เปลี่ยนเป็นความร้อน  IVt = J(m_c c_c + m_w c_w)ΔT
     กราฟ ΔT (แกน Y) กับ t (แกน X) · ความชัน = ΔT/Δt
     J = IV / [ (m_c c_c + m_w c_w) · (ΔT/Δt) ]
     c_น้ำ = 1.0 · c_อะลูมิเนียม = 0.21 kcal/kg·°C · เทียบ J = 4186 J/kcal
   ========================================================================== */
"use strict";

const B = window.Brief;
const { $, $$, plotXY, slopeThroughOrigin } = B;

const STORE = "lab08-electrical-equivalent-heat-brief-v1";
const DEFAULTS = { cC: "0.21", cW: "1.0", Jref: "4186" };
const EXAMPLE = { V: 10, I: 2, mC: 0.10, cC: 0.21, mW: 0.20, cW: 1.0, slope: 0.02162 };

const fieldNum = (id) => { const el = document.getElementById(id); if (!el || el.value.trim() === "") return NaN; const v = Number(el.value); return Number.isFinite(v) ? v : NaN; };
const cellNum = (el) => (el && el.value.trim() !== "" && Number.isFinite(Number(el.value)) ? Number(el.value) : NaN);
const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d }) : "—");
const setOut = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

function updateWorksheet() {
  const V = fieldNum("volt"), I = fieldNum("amp");
  const mC = fieldNum("mC"), cC = fieldNum("cC"), mW = fieldNum("mW"), cW = fieldNum("cW");
  const Jref = fieldNum("Jref");
  const heatCap = mC * cC + mW * cW;     // kcal/°C

  const pts = [];
  $$("#heatBody tr[data-row]").forEach((tr) => {
    const t = cellNum($("[data-t]", tr)), dT = cellNum($("[data-dt]", tr));
    if (Number.isFinite(t) && Number.isFinite(dT)) pts.push({ x: t, y: dT });
  });
  const slope = slopeThroughOrigin(pts);   // ΔT/Δt (°C/s)
  const P = Number.isFinite(I) && Number.isFinite(V) ? I * V : NaN;
  const J = Number.isFinite(P) && Number.isFinite(heatCap) && Number.isFinite(slope) && slope > 0 && heatCap > 0
    ? P / (heatCap * slope) : NaN;
  const err = Number.isFinite(J) && Number.isFinite(Jref) && Jref > 0 ? (Math.abs(J - Jref) / Jref) * 100 : NaN;

  setOut("powerOutput", Number.isFinite(P) ? `${fmt(P, 2)} W` : "—");
  setOut("capOutput", Number.isFinite(heatCap) ? `${fmt(heatCap, 4)} kcal/°C` : "—");
  setOut("slopeOutput", Number.isFinite(slope) ? `${fmt(slope, 4)} °C/s` : "—");
  setOut("jOutput", Number.isFinite(J) ? `${fmt(J, 0)} J/kcal` : "—");
  setOut("errOutput", Number.isFinite(err) ? `${err.toFixed(2)} %` : "—");
  plotXY($("#heatGraph"), pts, { slope, xlabel: "t (s)", ylabel: "ΔT (°C)" });
}

function renderExample() {
  const body = $("#exampleBody");
  if (!body) return;
  const { V, I, mC, cC, mW, cW, slope } = EXAMPLE;
  const P = I * V, cap = mC * cC + mW * cW, J = P / (cap * slope);
  const step = (label, eq, res) => `<div class="calc-step"><span class="cs-label">${label}</span><span class="cs-eq">\\(${eq}\\)</span><span class="cs-res">= ${res}</span></div>`;
  body.innerHTML =
    `<p class="muted" style="margin:0 0 .8rem">ค่าสมมติ: \\(V=${V}\\,V,\\ I=${I}\\,A\\) · แคลอรีมิเตอร์ \\(m_c=${mC}\\,kg\\), น้ำ \\(m_w=${mW}\\,kg\\) · ความชัน \\(\\Delta T/\\Delta t=${slope}\\,°C/s\\)</p>` +
    `<div class="calc-steps">` +
    step("กำลังไฟฟ้า P = IV", `P=${I}\\times ${V}`, `${P.toFixed(1)}\\,\\mathrm{W}`) +
    step("ความจุความร้อน m_c c_c + m_w c_w", `${mC}(${cC})+${mW}(${cW})`, `${cap.toFixed(3)}\\,\\mathrm{kcal/°C}`) +
    step("สมมูลความร้อน J = P/((mc)·slope)", `J=\\dfrac{${P.toFixed(1)}}{${cap.toFixed(3)}\\times ${slope}}`, `${J.toFixed(0)}\\,\\mathrm{J/kcal}`) +
    `</div>`;
}

B.init({ store: STORE, defaults: DEFAULTS, onInput: updateWorksheet, onReady: () => { renderExample(); } });
