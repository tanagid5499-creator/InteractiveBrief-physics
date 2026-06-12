/* ============================================================================
   INTERACTIVE LAB BRIEF · brief-core.js  (shared across all 261111 labs)
   ----------------------------------------------------------------------------
   The lab-AGNOSTIC infrastructure extracted from the Lab 02 reference build:
     number formatting · KaTeX rendering · show/hide · phase-nav dropdown ·
     scroll-spy + stepper · present (deck) mode · localStorage worksheet store ·
     toast · equipment lightbox · display-ratio toggle · scroll reveals.

   Each lab's own js/app.js defines the physics (constants, worksheet compute,
   graph, worked example, prediction) and then calls:

       Brief.init({
         store:    "labNN-...-brief-v1",   // localStorage namespace
         defaults: { inputId: "value", … },// reset-to values, keyed by input id
         onInput:  updateWorksheet,         // recompute on any worksheet input / reset
         onReady:  () => { renderExample(); wirePrediction(); }, // one-time lab setup
       });

   Helpers a lab page needs are exposed on window.Brief (see the export at the end).
   ========================================================================== */
"use strict";

(function () {
  /* ── per-lab config (filled by Brief.init) ────────────────────────────── */
  let CFG = { store: "lab-brief", defaults: {}, onInput: null, onReady: null };

  /* ── tiny helpers ─────────────────────────────────────────────────────── */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* number formatter — 4 sig figs, scientific ×10ⁿ when |v|≥1e5 or |v|<1e-3 */
  function formatValue(value, sig = 4) {
    if (!Number.isFinite(value)) return { text: "—", html: "—" };
    const abs = Math.abs(value);
    if (abs !== 0 && (abs >= 1e5 || abs < 1e-3)) {
      const [m, e] = value.toExponential(sig - 1).split("e");
      const exp = parseInt(e, 10);
      return { text: `${m}×10^${exp}`, html: `${m}×10<sup>${exp}</sup>` };
    }
    const t = value.toLocaleString("en-US", { maximumSignificantDigits: sig });
    return { text: t, html: t };
  }
  const fv = (v) => formatValue(v).html;

  /* LaTeX form of a value for KaTeX (mantissa × 10^exp), mirrors formatValue's text output */
  function fvTex(value, sig = 4) {
    const t = formatValue(value, sig).text;
    if (t === "—") return t;
    const m = t.match(/^(.*)×10\^(-?\d+)$/);
    return m ? `${m[1]}\\times 10^{${m[2]}}` : t;
  }
  /* render LaTeX → KaTeX HTML string, with an HTML/text fallback when KaTeX isn't available (offline) */
  function tex(latex, fallback, display = false) {
    if (window.katex) {
      try { return katex.renderToString(latex, { throwOnError: false, displayMode: display }); } catch (e) {}
    }
    return fallback != null ? fallback : latex;
  }
  /* value → KaTeX HTML string (mantissa×10^exp via fvTex); falls back to the mono pretty-HTML offline */
  const fvK = (v) => Number.isFinite(v) ? tex(fvTex(v), fv(v)) : "—";
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── generic math + DOM helpers ───────────────────────────────────────── */
  function average(values) {
    const ok = values.filter(Number.isFinite);
    return ok.length ? ok.reduce((s, v) => s + v, 0) / ok.length : NaN;
  }
  const percentError = (y, ref) =>
    Number.isFinite(y) && ref > 0 ? (Math.abs(y - ref) / ref) * 100 : NaN;

  const numberFrom = (id) => {
    const el = document.getElementById(id);
    if (!el || el.value.trim() === "") return NaN;
    return Number(el.value);
  };

  function setText(id, html, isHTML) {
    const el = document.getElementById(id);
    if (el) { if (isHTML) el.innerHTML = html; else el.textContent = html; }
  }

  /* ── instrument readout: roll a value into place ──────────────────────────
     (cancelable; skips if unchanged; instant on reduced-motion) */
  function rollValue(el, value, unit) {
    if (!el) return;
    const f = formatValue(value);
    const finalHTML = !Number.isFinite(value) ? "—" : (unit ? `${fvK(value)} ${unit}` : fvK(value));  // KaTeX settled value
    if (el._rollRaf) cancelAnimationFrame(el._rollRaf);
    if (REDUCED_MOTION || el._lastVal === value || !Number.isFinite(value) || !f.text.includes("×10^")) {
      el.innerHTML = finalHTML; el._lastVal = value; return;
    }
    el._lastVal = value;
    const [mantStr, expStr] = f.text.split("×10^");
    const target = parseFloat(mantStr);
    const decimals = (mantStr.split(".")[1] || "").length || 3;
    const dur = 520, t0 = performance.now();
    const frame = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.innerHTML = `${(target * (1 - Math.pow(1 - p, 3))).toFixed(decimals)}×10<sup>${expStr}</sup>${unit ? " " + unit : ""}`;
      if (p < 1) el._rollRaf = requestAnimationFrame(frame); else { el.innerHTML = finalHTML; el._rollRaf = 0; }
    };
    el._rollRaf = requestAnimationFrame(frame);
  }
  function rollPercent(el, err) {
    if (!el) return;
    if (el._rollRaf) cancelAnimationFrame(el._rollRaf);
    if (!Number.isFinite(err)) { el.innerHTML = "—"; el._lastVal = NaN; return; }
    const finalHTML = tex(`${err.toFixed(2)}\\%`, `${err.toFixed(2)}%`);   // KaTeX settled value
    if (REDUCED_MOTION || el._lastVal === err) { el.innerHTML = finalHTML; el._lastVal = err; return; }
    el._lastVal = err;
    const dur = 520, t0 = performance.now();
    const frame = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = `${(err * (1 - Math.pow(1 - p, 3))).toFixed(2)}%`;
      if (p < 1) el._rollRaf = requestAnimationFrame(frame); else { el.innerHTML = finalHTML; el._rollRaf = 0; }
    };
    el._rollRaf = requestAnimationFrame(frame);
  }

  /* ============================================================================
     KaTeX RENDERING (static [data-tex] blocks + standalone <i> variables)
     ========================================================================== */
  function renderMath(root = document) {
    if (!window.katex) return;
    root.querySelectorAll("[data-tex]").forEach((el) => {
      if (el.dataset.rendered) return;
      try {
        katex.render(el.dataset.tex, el, { throwOnError: false, displayMode: el.hasAttribute("data-display") });
        el.dataset.rendered = "1";
      } catch (e) {}
    });
  }
  /* Standalone prose variables (<i>X</i> plus any immediately-adjacent <sub>/<sup>) → inline KaTeX,
     so every symbol shares the math font. Structured math (.formula/.eq/.u) is handled via data-tex. */
  function renderInlineVars(root = document) {
    if (!window.katex) return;
    root.querySelectorAll("i").forEach((iEl) => {
      const base = iEl.textContent.trim();
      if (!base || iEl.closest(".formula, .eq, .u, [data-tex], .katex")) return;
      let latex = base;
      const consume = [];
      let n = iEl.nextSibling;
      while (n && n.nodeType === 1 && (n.tagName === "SUB" || n.tagName === "SUP")) {
        const s = n.textContent.trim();
        latex += (n.tagName === "SUB" ? "_{" : "^{") + (/^[0-9]+$/.test(s) ? s : `\\text{${s}}`) + "}";
        consume.push(n);
        n = n.nextSibling;
      }
      const span = document.createElement("span");
      try { katex.render(latex, span, { throwOnError: false }); } catch (e) { return; }
      iEl.replaceWith(span);
      consume.forEach((c) => c.remove());
    });
  }

  /* KaTeX auto-render: inline \( … \) and display \[ … \] delimiters.
     Loaded only on labs that include the auto-render extension; gracefully skipped otherwise. */
  function autoRenderMath(root = document.body) {
    if (!window.renderMathInElement) return;
    try {
      renderMathInElement(root, {
        delimiters: [
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false },
        ],
        throwOnError: false,
        ignoredClasses: ["no-katex"],
      });
    } catch (e) {}
  }

  /* ============================================================================
     GENERIC SHOW / HIDE TOGGLE
     ========================================================================== */
  function wireToggle(showId, hideId, bodyId) {
    const show = document.getElementById(showId);
    const hide = document.getElementById(hideId);
    const body = document.getElementById(bodyId);
    if (!show || !hide || !body) return;
    show.addEventListener("click", () => { body.hidden = false; show.hidden = true; hide.hidden = false; });
    hide.addEventListener("click", () => { body.hidden = true;  show.hidden = false; hide.hidden = true; });
  }

  /* inline quizzes: a .quick-quiz with [data-quiz-option] buttons + data-answer.
     Click → mark correct/incorrect + feedback. Works for every lab. */
  function wireQuizzes() {
    $$("[data-quiz-option]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const quiz = btn.closest(".quick-quiz");
        if (!quiz) return;
        const answer = quiz.dataset.answer;
        const isCorrect = btn.dataset.quizOption === answer;
        $$("[data-quiz-option]", quiz).forEach((b) => {
          b.classList.toggle("is-correct", b.dataset.quizOption === answer && isCorrect);
          b.classList.toggle("is-incorrect", b === btn && !isCorrect);
          b.setAttribute("aria-pressed", String(b === btn));
        });
        quiz.classList.add("is-answered");
        quiz.classList.toggle("is-correct", isCorrect);
        const fb = quiz.querySelector("[data-quiz-feedback]");
        if (fb) fb.textContent = isCorrect
          ? "ถูกต้อง 👍"
          : `ยังไม่ใช่ — คำตอบที่ถูกคือ “${answer}”`;
      });
    });
  }

  /* phase nav: 4 phase buttons, each toggles a dropdown of its sections (click / outside-click / Esc closes) */
  function wirePhaseNav() {
    const phases = $$(".phase");
    const closeAll = () => phases.forEach((p) => {
      p.classList.remove("open");
      p.querySelector(".phase-btn")?.setAttribute("aria-expanded", "false");
    });
    phases.forEach((ph) => {
      const btn = ph.querySelector(".phase-btn");
      btn?.addEventListener("click", (e) => {
        e.stopPropagation();
        const wasOpen = ph.classList.contains("open");
        closeAll();
        if (!wasOpen) { ph.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
      });
    });
    document.addEventListener("click", closeAll);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
  }

  /* ============================================================================
     EQUIPMENT LIGHTBOX (click a schematic / photo → enlarged dialog)
     Clones the card's schematic + caption into a modal. Works as-is when the
     <svg> schematics are later swapped for real <img> photos. Esc / ✕ / backdrop close.
     ========================================================================== */
  function wireEquipLightbox() {
    const lb = $("#lightbox");
    const body = $("#lightboxBody");
    const closeBtn = $("#lightboxClose");
    if (!lb || !body || !closeBtn) return;
    let lastFocus = null;
    const open = (card) => {
      if (!card) return;
      const ico = card.querySelector(".equip-photo .equip-ico, .equip-photo img");
      const cap = card.querySelector("figcaption");
      body.innerHTML = "";
      const fig = document.createElement("div");
      fig.className = "lb-figure";
      if (ico) fig.appendChild(ico.cloneNode(true));
      body.appendChild(fig);
      if (cap) body.appendChild(cap.cloneNode(true));
      lastFocus = document.activeElement;
      lb.hidden = false;
      document.body.classList.add("lb-open");
      closeBtn.focus();
    };
    const close = () => {
      if (lb.hidden) return;
      lb.hidden = true;
      document.body.classList.remove("lb-open");
      body.innerHTML = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    $$(".equip-photo").forEach((btn) =>
      btn.addEventListener("click", () => open(btn.closest(".equip-card"))));
    closeBtn.addEventListener("click", close);
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "Tab") { e.preventDefault(); closeBtn.focus(); }   // trap focus: the close button is the only control
    });
  }

  /* ============================================================================
     DISPLAY RATIO — a segmented control selects จอเต็ม / 4:3 (โปรเจกเตอร์) / 16:9 (ทีวี).
     Drives BOTH the global stage frame and the present-mode letterbox
     (CSS keys off body.ratio-43 / body.ratio-169). Persisted per lab.
     ========================================================================== */
  const RATIOS = ["full", "43", "169"];
  function applyRatio(r) {
    if (!RATIOS.includes(r)) r = "full";
    document.body.classList.toggle("ratio-43", r === "43");
    document.body.classList.toggle("ratio-169", r === "169");
    $$(".ratio-seg button").forEach((b) => {
      const on = b.dataset.ratio === r;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try { localStorage.setItem(`${CFG.store}-ratio`, r); } catch (e) {}
  }
  function wireRatioToggle() {
    const seg = $(".ratio-seg");
    if (!seg) return;
    let saved = "full";
    try { saved = localStorage.getItem(`${CFG.store}-ratio`) || "full"; } catch (e) {}
    applyRatio(saved);
    $$(".ratio-seg button").forEach((b) =>
      b.addEventListener("click", () => applyRatio(b.dataset.ratio)));
  }

  /* ── localStorage persistence for worksheet inputs ────────────────────── */
  function saveStore() {
    const data = {};
    $$("[data-store]").forEach((el) => { data[el.dataset.store] = el.value; });
    try { localStorage.setItem(`${CFG.store}-worksheet`, JSON.stringify(data)); } catch (e) {}
  }
  function loadStore() {
    let data = {};
    try { data = JSON.parse(localStorage.getItem(`${CFG.store}-worksheet`) || "{}"); } catch (e) {}
    $$("[data-store]").forEach((el) => {
      if (Object.prototype.hasOwnProperty.call(data, el.dataset.store)) el.value = data[el.dataset.store];
      el.addEventListener("input", () => { saveStore(); if (CFG.onInput) CFG.onInput(); });
    });
  }
  let toastTimer = null;
  function showToast(msg, undoFn, ms = 6000) {
    const t = $("#toast");
    if (!t) return;
    $("#toastMsg").textContent = msg;
    t.hidden = false;
    window.setTimeout(() => t.classList.add("in"), 10);
    const hide = () => { t.classList.remove("in"); window.setTimeout(() => { t.hidden = true; }, 250); };
    clearTimeout(toastTimer);
    $("#toastUndo").onclick = () => { clearTimeout(toastTimer); hide(); if (undoFn) undoFn(); };
    toastTimer = window.setTimeout(hide, ms);
  }

  function resetTable() {
    // snapshot first so the wipe is recoverable
    const snapshot = {};
    $$("[data-store]").forEach((el) => { snapshot[el.dataset.store] = el.value; });
    const hadData = Object.values(snapshot).some((v) => v !== "" && v != null);

    try { localStorage.removeItem(`${CFG.store}-worksheet`); } catch (e) {}
    $$("[data-store]").forEach((el) => {
      el.value = Object.prototype.hasOwnProperty.call(CFG.defaults, el.id) ? CFG.defaults[el.id] : "";
    });
    if (CFG.onInput) CFG.onInput();

    if (hadData) {
      showToast("ล้างข้อมูลตารางแล้ว", () => {
        $$("[data-store]").forEach((el) => {
          if (Object.prototype.hasOwnProperty.call(snapshot, el.dataset.store)) el.value = snapshot[el.dataset.store];
        });
        saveStore();
        if (CFG.onInput) CFG.onInput();
      });
    }
  }

  /* ============================================================================
     NAVIGATION · PROGRESS · STEPPER
     ========================================================================== */
  let sections = [];
  let chips = [];
  let currentIndex = 0;
  let lastSpyTs = 0;
  let navTarget = -1;      // section we're smooth-scrolling toward; spy won't override until we arrive
  let navTargetTimer = 0;            // while a programmatic scroll runs, don't let the spy override the chosen section
  const NAV_LINE = 100;           // the "you are here" line, just below the sticky header

  function activeIndexForScroll() {
    let idx = 0;
    // live measurement every time — cached offsets could go stale and freeze the highlight
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= NAV_LINE) idx = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) idx = sections.length - 1;
    return idx;
  }

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    const bar = $("#readBar");
    if (bar) bar.style.transform = `scaleX(${pct / 100})`;
    const prog = $(".read-progress");
    if (prog) prog.setAttribute("aria-valuenow", Math.round(pct));
  }

  function onScroll() {
    updateProgress();
    const now = performance.now();
    if (now - lastSpyTs < 90) return;       // light throttle; no rAF so it can never get stuck
    lastSpyTs = now;
    const idx = activeIndexForScroll();
    if (navTarget !== -1) {                  // a click/keyboard jump is in flight: hold its highlight until it arrives
      if (idx === navTarget) navTarget = -1; // arrived — resume normal spy afterwards
      return;
    }
    if (idx !== currentIndex) setActiveSection(idx);
  }

  function setActiveSection(idx) {
    currentIndex = Math.max(0, Math.min(idx, sections.length - 1));
    const section = sections[currentIndex];
    setText("secNow", String(currentIndex + 1).padStart(2, "0"));
    setText("stepLabel", section.dataset.title || "");
    const prev = $("#prevSec"), next = $("#nextSec");
    if (prev) prev.disabled = currentIndex === 0;
    if (next) next.disabled = currentIndex === sections.length - 1;
    let activeChip = null;
    chips.forEach((c) => {
      const on = c.getAttribute("href") === `#${section.id}`;
      c.classList.toggle("is-active", on);
      if (on) activeChip = c;
    });
    // mark the active phase button (the phase whose dropdown contains the current section)
    $$(".phase-btn").forEach((b) => b.classList.remove("is-active"));
    if (activeChip) {
      const phaseBtn = activeChip.closest(".phase")?.querySelector(".phase-btn");
      if (phaseBtn) phaseBtn.classList.add("is-active");
    }
  }

  // jump to a section: commit the highlight immediately, then smooth-scroll (fixes the off-by-one + stuck stepper)
  function navTo(idx) {
    idx = Math.max(0, Math.min(idx, sections.length - 1));
    navTarget = idx;
    clearTimeout(navTargetTimer);
    navTargetTimer = setTimeout(() => { navTarget = -1; }, 1400);  // safety release if scrollend never fires
    setActiveSection(idx);
    updateProgress();
    sections[idx].scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ── present mode (hybrid deck: one section per screen) ───────────────── */
  let presentIndex = 0;
  function presentShow(i) {
    presentIndex = Math.max(0, Math.min(i, sections.length - 1));
    sections.forEach((s, idx) => s.classList.toggle("is-present", idx === presentIndex));
    sections[presentIndex].scrollTop = 0;
    setText("presentCounter", `${presentIndex + 1} / ${sections.length}`);
    const pp = document.querySelector("#presentProgress span");
    if (pp) pp.style.transform = `scaleX(${(presentIndex + 1) / sections.length})`;
    const p = $("#presentPrev"), n = $("#presentNext");
    if (p) p.disabled = presentIndex === 0;
    if (n) n.disabled = presentIndex === sections.length - 1;
  }
  function enterPresent() {
    document.body.classList.add("present-mode");
    document.body.classList.remove("present-back");
    const bar = $("#presentBar"); if (bar) bar.hidden = false;
    presentShow(currentIndex);
  }
  function exitPresent() {
    document.body.classList.remove("present-mode", "present-back", "vt-active");
    const bar = $("#presentBar"); if (bar) bar.hidden = true;
    sections.forEach((s) => s.classList.remove("is-present"));
    navTo(presentIndex);
  }
  const presentGo = (d) => {
    const target = Math.max(0, Math.min(presentIndex + d, sections.length - 1));
    if (target === presentIndex) return;
    document.body.classList.toggle("present-back", d < 0);   // direction tells the CSS which way to slide
    presentShow(target);   // base directional slide only — the View Transition stuttered against the live 3D render
  };

  /* ============================================================================
     SCROLL REVEAL  (safe: visible by default, JS-gated, failsafe forces visible)
     ========================================================================== */
  function setupReveals() {
    if (REDUCED_MOTION || !("IntersectionObserver" in window)) return;
    // Sibling-staggered reveals on grids / lists / signature blocks only. NOT section-heads or leads:
    // a uniform "every section fades up" is the AI tell, so headings stay as stable anchors.
    const revealSel = ".info-card, .formula-card, .equip-card, .q-card, .objective-list li, .steps li, " +
      ".material-block, .prompt-card, .note, .table-wrap, .result-summary, .conclusion-points li, " +
      "#data .chart-card";
    const reveals = $$(revealSel).filter((el) => !el.closest(".hero"));
    reveals.forEach((el) => el.classList.add("reveal"));
    const charts = $$(".theory-grid .chart-card");   // the stress–strain plot self-draws (signature moment)
    const all = reveals.concat(charts);
    if (!all.length) return;
    document.body.classList.add("js-reveal");
    const fire = (el) => {
      if (el.classList.contains("chart-card") && el.closest(".theory-grid")) { el.classList.add("drawn"); return; }
      const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
      el.style.transitionDelay = Math.min(Math.max(0, sibs.indexOf(el)), 6) * 55 + "ms";
      el.classList.add("in-view");
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { fire(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.04 });
    all.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) fire(el);   // already visible → fire now (no flash)
      else io.observe(el);
    });
    window.setTimeout(() => all.forEach(fire), 1500);   // failsafe: never leave anything hidden / undrawn
  }

  /* Generic XY scatter + optional trend-through-origin, auto-scaled.
     Reuses the .axis / .trend / .g-pt classes from drafting-sheet.css.
     pts = [{x,y}, …] · opts = { xlabel, ylabel, slope (through origin), maxX } */
  function plotXY(svg, pts, opts = {}) {
    if (!svg) return;
    const W = 520, H = 320, P = { l: 70, r: 26, t: 24, b: 52 };
    const usable = (pts || []).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    const maxX = Math.max(...usable.map((p) => p.x), opts.maxX || 0, 1e-9);
    const maxY = Math.max(...usable.map((p) => p.y), Number.isFinite(opts.slope) ? opts.slope * maxX : 0, 1e-9);
    const xS = (v) => P.l + (v / maxX) * (W - P.l - P.r);
    const yS = (v) => H - P.b - (v / maxY) * (H - P.t - P.b);
    let h =
      `<line class="axis" x1="${P.l}" y1="${H - P.b}" x2="${W - P.r}" y2="${H - P.b}"></line>` +
      `<line class="axis" x1="${P.l}" y1="${H - P.b}" x2="${P.l}" y2="${P.t}"></line>`;
    if (Number.isFinite(opts.slope) && opts.slope > 0)
      h += `<line class="trend" x1="${P.l}" y1="${(H - P.b).toFixed(1)}" x2="${xS(maxX).toFixed(1)}" y2="${yS(opts.slope * maxX).toFixed(1)}"></line>`;
    usable.forEach((p) => { h += `<circle class="g-pt" cx="${xS(p.x).toFixed(1)}" cy="${yS(p.y).toFixed(1)}" r="5" opacity="1"></circle>`; });
    if (opts.xlabel) h += `<text x="${W / 2}" y="${H - 12}" text-anchor="middle">${opts.xlabel}</text>`;
    if (opts.ylabel) h += `<text x="18" y="${H / 2}" text-anchor="middle" transform="rotate(-90 18 ${H / 2})">${opts.ylabel}</text>`;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = h;
  }
  /* least-squares slope through the origin for [{x,y}] data */
  function slopeThroughOrigin(pts) {
    const u = (pts || []).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    const num = u.reduce((s, p) => s + p.x * p.y, 0);
    const den = u.reduce((s, p) => s + p.x * p.x, 0);
    return den > 0 ? num / den : NaN;
  }

  /* a11y: give every worksheet-table <input> an accessible name derived from its
     column header + row header (e.g. "V_C (V), t (s) 40"). The visual context is a
     <th scope=col>/<th scope=row> grid, but an explicit aria-label is what screen
     readers announce reliably. Runs BEFORE KaTeX so header text is still raw source,
     then strips the \( \) / \command LaTeX so the spoken label stays clean.
     Skips inputs already wrapped in <label> or carrying aria-label/labelledby. */
  function labelTableInputs() {
    const clean = (s) => (s || "")
      .replace(/\\[a-zA-Z]+/g, "")        // \theta \ln \dfrac … LaTeX commands
      .replace(/\\[()[\]]/g, "")          // \( \) \[ \] delimiters
      .replace(/[_^]\{([^}]*)\}/g, "$1")  // _{2} / ^{2} → keep content, drop marker
      .replace(/[_^](\S)/g, "$1")         // _2 / ^2  → keep the char, drop the marker
      .replace(/[{}$]/g, "")              // stray braces / $
      .replace(/\s+/g, " ").trim();
    $$(".data-table").forEach((table) => {
      const colHeads = $$("thead th", table).map((th) => clean(th.textContent));
      const firstCol = colHeads[0] || "";
      $$("tbody tr", table).forEach((tr) => {
        const cells = $$("th, td", tr);
        const rowHead = clean(($("th[scope='row']", tr) || cells[0] || {}).textContent);
        $$("input, select, textarea", tr).forEach((inp) => {
          if (inp.getAttribute("aria-label") || inp.getAttribute("aria-labelledby") || inp.closest("label")) return;
          const colName = colHeads[cells.indexOf(inp.closest("th, td"))] || "";
          const label = [colName, rowHead ? `${firstCol} ${rowHead}` : ""].filter(Boolean).join(", ");
          if (label) inp.setAttribute("aria-label", label);
        });
      });
    });
  }

  /* ============================================================================
     INIT  (wires all shared chrome; lab hooks come from the config object)
     ========================================================================== */
  function init(config) {
    CFG = Object.assign(CFG, config || {});

    const run = () => {
      sections = $$(".section[id]");
      chips = $$(".chip");
      document.body.classList.remove("present-mode");   // never start stuck in present mode
      labelTableInputs();   // a11y: name worksheet inputs from their headers (before KaTeX rewrites header text)

      // worksheet
      loadStore();
      if (CFG.onInput) CFG.onInput();
      $("#resetTable")?.addEventListener("click", resetTable);

      // lab-specific one-time setup (worked example, prediction, …) — before math render
      if (CFG.onReady) CFG.onReady();
      renderMath();         // static symbolic math: formula cards, inline .eq, input labels (lab-02 style)
      renderInlineVars();   // standalone <i> variables in prose → inline KaTeX (lab-02 style)
      autoRenderMath();     // \( … \) / \[ … \] delimiters (labs that author math inline)
      wireToggle("exampleShow", "exampleHide", "exampleBody");
      wireToggle("answerShow", "answerHide", "answerBody");
      wireQuizzes();

      // equipment lightbox + display-ratio toggle (4:3 / 16:9)
      wireEquipLightbox();
      wireRatioToggle();

      // nav — the scroll-spy measures section positions live, so there are no cached offsets to maintain
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      window.addEventListener("load", onScroll);
      window.addEventListener("scrollend", () => { navTarget = -1; setActiveSection(activeIndexForScroll()); });
      chips.forEach((c) => c.addEventListener("click", (e) => {
        const target = document.getElementById((c.getAttribute("href") || "").slice(1));
        if (!target) return;
        e.preventDefault();
        navTo(sections.indexOf(target));
      }));
      wirePhaseNav();
      $("#prevSec")?.addEventListener("click", () => navTo(currentIndex - 1));
      $("#nextSec")?.addEventListener("click", () => navTo(currentIndex + 1));

      // present mode
      $("#presentToggle")?.addEventListener("click", enterPresent);
      $("#presentExit")?.addEventListener("click", exitPresent);
      $("#presentPrev")?.addEventListener("click", () => presentGo(-1));
      $("#presentNext")?.addEventListener("click", () => presentGo(1));

      // hero spotlight follows the cursor — rAF-throttled to one repaint per frame; skipped under reduced-motion
      const heroEl = $(".hero");
      if (heroEl && !REDUCED_MOTION) {
        let glowRaf = 0, lastPt = null;
        const applyGlow = () => {
          glowRaf = 0;
          const r = heroEl.getBoundingClientRect();
          heroEl.style.setProperty("--mx", `${(((lastPt.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
          heroEl.style.setProperty("--my", `${(((lastPt.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
        };
        heroEl.addEventListener("pointermove", (e) => {
          lastPt = e;
          if (!glowRaf) glowRaf = requestAnimationFrame(applyGlow);
        }, { passive: true });
      }

      document.addEventListener("keydown", (e) => {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (["input", "textarea", "select"].includes(tag)) return;
        if (document.body.classList.contains("present-mode")) {
          if (["ArrowRight", " ", "PageDown"].includes(e.key)) { e.preventDefault(); presentGo(1); }
          else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); presentGo(-1); }
          else if (e.key === "Escape") { e.preventDefault(); exitPresent(); }
          return;
        }
        if (tag === "button") return;
        if (e.key === "ArrowRight") { e.preventDefault(); navTo(currentIndex + 1); }
        if (e.key === "ArrowLeft")  { e.preventDefault(); navTo(currentIndex - 1); }
      });

      setActiveSection(0);
      onScroll();
      setupReveals();
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
    else run();
  }

  /* ── export the helpers a lab's app.js needs ──────────────────────────── */
  window.Brief = {
    $, $$,
    formatValue, fv, fvTex, tex, fvK,
    REDUCED_MOTION,
    average, percentError, numberFrom, setText,
    rollValue, rollPercent,
    renderMath, renderInlineVars,
    wireToggle, showToast,
    plotXY, slopeThroughOrigin,
    init,
  };
})();
