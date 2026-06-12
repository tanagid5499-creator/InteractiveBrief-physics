const sectionSelector = ".article-section";
let points = [];
let sections = [];
let currentPoint = -1;
let currentSectionIndex = 0;

function updateProgress() {
  const total = points.length;
  const completed = Math.max(0, currentPoint + 1);
  const progressText = document.getElementById("progressText");
  const progressFill = document.getElementById("progressFill");
  if (progressText) progressText.textContent = `${completed} / ${total}`;
  if (progressFill) progressFill.style.width = total ? `${(completed / total) * 100}%` : "0";
}

function setCurrentPoint(index) {
  if (!points.length) return;
  currentPoint = Math.max(0, Math.min(index, points.length - 1));
  points.forEach((point, pointIndex) => {
    point.classList.toggle("is-revealed", pointIndex <= currentPoint);
    point.classList.toggle("is-current", pointIndex === currentPoint);
  });
  points[currentPoint].scrollIntoView({ behavior: "smooth", block: "center" });
  const step = document.getElementById("currentBriefingStep");
  if (step) step.textContent = points[currentPoint].textContent.trim().slice(0, 150);
  updateProgress();
}

function enableTeacherMode(startAt = 0) {
  document.body.classList.add("teacher-mode");
  document.getElementById("teacherModeButton").textContent = "ปิดโหมดนำเสนอ";
  setCurrentPoint(startAt);
}

function disableTeacherMode() {
  document.body.classList.remove("teacher-mode");
  points.forEach((point) => point.classList.remove("is-revealed", "is-current"));
  currentPoint = -1;
  document.getElementById("teacherModeButton").textContent = "โหมดนำเสนอ";
  const step = document.getElementById("currentBriefingStep");
  if (step) step.textContent = "ยังไม่ได้เริ่มนำเสนอ";
  updateProgress();
}

function nextPoint() {
  if (!document.body.classList.contains("teacher-mode")) enableTeacherMode(0);
  else setCurrentPoint(currentPoint + 1);
}

function previousPoint() {
  if (!document.body.classList.contains("teacher-mode")) enableTeacherMode(0);
  else setCurrentPoint(currentPoint - 1);
}

function updateSectionLabels(section) {
  const label = section?.dataset.sectionTitle || "ภาพรวม";
  const current = document.getElementById("currentSectionLabel");
  const bottom = document.getElementById("bottomSectionLabel");
  if (current) current.textContent = label;
  if (bottom) bottom.textContent = label;
  document.querySelectorAll(".section-nav a").forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${section.id}`);
  });
}

function goToSection(delta) {
  currentSectionIndex = Math.max(0, Math.min(currentSectionIndex + delta, sections.length - 1));
  sections[currentSectionIndex]?.scrollIntoView({ behavior: "smooth", block: "start" });
  updateSectionLabels(sections[currentSectionIndex]);
}

function setupSectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    currentSectionIndex = sections.indexOf(visible.target);
    updateSectionLabels(visible.target);
  }, { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.25, 0.5] });
  sections.forEach((section) => observer.observe(section));
}

function setupToolbar() {
  document.getElementById("navToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
  });
  document.querySelectorAll(".section-nav a").forEach((link) => {
    link.addEventListener("click", () => document.body.classList.remove("nav-open"));
  });
}

function setupKeys() {
  document.addEventListener("keydown", (event) => {
    const activeTag = document.activeElement?.tagName?.toLowerCase();
    if (["input", "textarea", "select"].includes(activeTag)) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextPoint();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousPoint();
    }
    if (event.key.toLowerCase() === "f") {
      document.body.classList.toggle("focus-mode");
    }
    if (event.key.toLowerCase() === "d") {
      document.body.classList.toggle("demo-hidden");
    }
  });
}

export function initBriefing() {
  points = Array.from(document.querySelectorAll("[data-briefing-point]"));
  sections = Array.from(document.querySelectorAll(sectionSelector));
  updateProgress();
  setupSectionObserver();
  setupToolbar();
  setupKeys();

  document.getElementById("teacherModeButton")?.addEventListener("click", () => {
    if (document.body.classList.contains("teacher-mode")) disableTeacherMode();
    else enableTeacherMode(Math.max(0, currentPoint));
  });
  document.getElementById("startBriefingButton")?.addEventListener("click", () => enableTeacherMode(0));
  document.getElementById("nextPointButton")?.addEventListener("click", nextPoint);
  document.getElementById("previousPointButton")?.addEventListener("click", previousPoint);
  document.getElementById("nextSectionButton")?.addEventListener("click", () => goToSection(1));
  document.getElementById("prevSectionButton")?.addEventListener("click", () => goToSection(-1));
}
