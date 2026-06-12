import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

const canvas = document.getElementById("pendulumThreeCanvas");
const plotCanvas = document.getElementById("pendulumAnglePlot");
const plotContext = plotCanvas?.getContext("2d");
const stage = canvas?.closest(".pendulum-scene-wrap");
const fallback = document.getElementById("pendulumThreeFallback");
const controls = {
  length: document.getElementById("pendulumLength"),
  mass: document.getElementById("pendulumMass"),
  angle: document.getElementById("pendulumAngle"),
  damping: document.getElementById("pendulumDamping"),
  timeScale: document.getElementById("pendulumTimeScale"),
  pivot: document.getElementById("pendulumPivot")
};
const readouts = {
  length: document.getElementById("pendulumLengthReadout"),
  mass: document.getElementById("pendulumMassReadout"),
  angle: document.getElementById("pendulumAngleReadout"),
  damping: document.getElementById("pendulumDampingReadout"),
  timeScale: document.getElementById("pendulumTimeScaleReadout"),
  pivot: document.getElementById("pendulumPivotReadout"),
  mode: document.getElementById("pendulumModeReadout"),
  period: document.getElementById("pendulumPeriodReadout"),
  theta: document.getElementById("pendulumThetaReadout"),
  insight: document.getElementById("pendulumInsightReadout")
};
const modeButtons = Array.from(document.querySelectorAll("[data-pendulum-mode]"));
const viewButtons = Array.from(document.querySelectorAll("[data-pendulum-view]"));
const physicalOnlyControls = Array.from(document.querySelectorAll("[data-physical-control]"));
const resetButton = document.getElementById("pendulumResetButton");
const playButton = document.getElementById("pendulumPlayButton");
const trailToggle = document.getElementById("pendulumTrailToggle");

const sceneScale = 2.05;
const g = 9.8;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  mode: "simple",
  theta: degToRad(Number(controls.angle?.value || 18)),
  omega: 0,
  view: "front",
  cameraAzimuth: 0.62,
  cameraElevation: 0.26,
  draggingCamera: false,
  dragStartX: 0,
  dragStartY: 0,
  dragStartAzimuth: 0.62,
  dragStartElevation: 0.26,
  running: !reducedMotion,
  lastTime: 0,
  simulationTime: 0,
  frame: 0,
  lastThetaForQa: 0
};

const cameraTarget = new THREE.Vector3(0, -0.7, 0);
const trailPoints = [];
const angleSamples = [];
const maxTrailPoints = 96;
const maxAngleSamples = 540;
const graphWindowSeconds = 8;

let renderer;
let scene;
let camera;
let pendulumGroup;
let stringMesh;
let rodMesh;
let bobMesh;
let bodyMesh;
let pivotMesh;
let comMarker;
let arcLine;
let trailLine;
let rulerTicks;
let floorGrid;
let floorMesh;

function degToRad(value) {
  return value * Math.PI / 180;
}

function radToDeg(value) {
  return value * 180 / Math.PI;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function number(id, fallbackValue) {
  const node = controls[id];
  const value = Number(node?.value);
  return Number.isFinite(value) ? value : fallbackValue;
}

function params() {
  return {
    length: number("length", 0.8),
    mass: number("mass", 0.8),
    initialAngle: degToRad(number("angle", 18)),
    damping: number("damping", 0.03),
    timeScale: number("timeScale", 1),
    pivot: clamp(number("pivot", 0.12), 0.05, 0.45)
  };
}

function rulerCenterDistance(p = params()) {
  return Math.max(0.02, (0.5 - p.pivot) * p.length);
}

function rulerInertiaPerMass(p = params()) {
  return p.length * p.length / 12 + rulerCenterDistance(p) * rulerCenterDistance(p);
}

function format(value, digits = 3) {
  if (!Number.isFinite(value)) return "--";
  return value.toLocaleString("en-US", { maximumSignificantDigits: digits });
}

function setText(node, text) {
  if (node) node.textContent = text;
}

function makeCylinder(radius, color, roughness = 0.72) {
  const geometry = new THREE.CylinderGeometry(radius, radius, 1, 24);
  const material = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.08 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  return mesh;
}

function setupScene() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setClearColor(0xedf2f6, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xedf2f6);

  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
  positionCamera();

  scene.add(new THREE.HemisphereLight(0xffffff, 0xc6d4e1, 1.05));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
  keyLight.position.set(2.8, 4.6, 5.2);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 12;
  keyLight.shadow.camera.left = -4;
  keyLight.shadow.camera.right = 4;
  keyLight.shadow.camera.top = 4;
  keyLight.shadow.camera.bottom = -4;
  scene.add(keyLight);

  floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 4.8),
    new THREE.MeshStandardMaterial({ color: 0xe5e9f0, roughness: 0.86, metalness: 0 })
  );
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(0, -2.82, 0);
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  floorGrid = new THREE.GridHelper(6.4, 14, 0x81a1c1, 0xd8dee9);
  floorGrid.position.set(0, -2.8, 0);
  scene.add(floorGrid);

  const supportMaterial = new THREE.MeshStandardMaterial({ color: 0x5e81ac, roughness: 0.68, metalness: 0.18 });
  const crossbar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 0.08), supportMaterial);
  crossbar.position.set(0, 1.26, 0);
  scene.add(crossbar);
  const leftStand = new THREE.Mesh(new THREE.BoxGeometry(0.07, 3.5, 0.07), supportMaterial);
  leftStand.position.set(-1.25, -0.45, 0);
  scene.add(leftStand);
  [crossbar, leftStand].forEach((mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });

  pendulumGroup = new THREE.Group();
  pendulumGroup.position.set(0, 1.22, 0);
  scene.add(pendulumGroup);

  stringMesh = makeCylinder(0.012, 0x4c566a);
  rodMesh = makeCylinder(0.035, 0x5e81ac, 0.64);
  bobMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 28),
    new THREE.MeshStandardMaterial({ color: 0xb48ead, roughness: 0.58, metalness: 0.12 })
  );
  bobMesh.castShadow = true;
  bobMesh.receiveShadow = true;
  bodyMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xebcb8b, roughness: 0.7, metalness: 0.04 })
  );
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  pivotMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 24, 16),
    new THREE.MeshStandardMaterial({ color: 0x2e3440, roughness: 0.55 })
  );
  pivotMesh.castShadow = true;
  comMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 20, 12),
    new THREE.MeshStandardMaterial({ color: 0xbf616a, roughness: 0.5 })
  );
  comMarker.castShadow = true;
  rulerTicks = new THREE.LineSegments(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0x4c566a, transparent: true, opacity: 0.62 })
  );

  pendulumGroup.add(stringMesh, rodMesh, bobMesh, bodyMesh, pivotMesh, comMarker, rulerTicks);
  arcLine = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0xd08770, transparent: true, opacity: 0.78 })
  );
  scene.add(arcLine);
  trailLine = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0xb48ead, transparent: true, opacity: 0.72 })
  );
  scene.add(trailLine);

  resize();
  updateVisualModel();
}

function resize() {
  if (!renderer || !camera || !stage) return;
  const rect = stage.getBoundingClientRect();
  const width = Math.max(320, Math.floor(rect.width));
  const height = Math.max(320, Math.floor(rect.height));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  positionCamera();
  resizePlot();
}

function resizePlot() {
  if (!plotCanvas || !plotContext) return;
  const rect = plotCanvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(260, Math.floor(rect.width * pixelRatio));
  const height = Math.max(140, Math.floor(rect.height * pixelRatio));
  if (plotCanvas.width !== width || plotCanvas.height !== height) {
    plotCanvas.width = width;
    plotCanvas.height = height;
  }
  drawAnglePlot();
}

function positionCamera() {
  if (!camera) return;
  if (state.view === "inspect") {
    const radius = 7.8;
    const elevation = state.cameraElevation;
    camera.position.set(
      Math.sin(state.cameraAzimuth) * Math.cos(elevation) * radius,
      cameraTarget.y + Math.sin(elevation) * radius,
      Math.cos(state.cameraAzimuth) * Math.cos(elevation) * radius
    );
  } else {
    camera.position.set(0, -0.55, 8.4);
  }
  camera.lookAt(cameraTarget);
}

function setMode(mode) {
  state.mode = mode === "physical" ? "physical" : "simple";
  modeButtons.forEach((button) => {
    const selected = button.dataset.pendulumMode === state.mode;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  physicalOnlyControls.forEach((label) => label.classList.toggle("is-disabled", state.mode !== "physical"));
  if (controls.pivot) controls.pivot.disabled = state.mode !== "physical";
  resetMotion();
  resetTrail();
  resetAnglePlot();
  updateVisualModel();
  updateReadouts();
}

function setView(view) {
  state.view = view === "inspect" ? "inspect" : "front";
  stage?.classList.toggle("is-inspectable", state.view === "inspect");
  viewButtons.forEach((button) => {
    const selected = button.dataset.pendulumView === state.view;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  positionCamera();
}

function resetMotion() {
  state.theta = params().initialAngle;
  state.omega = 0;
  state.simulationTime = 0;
}

function resetTrail() {
  trailPoints.length = 0;
  updateTrailGeometry();
}

function resetAnglePlot() {
  angleSamples.length = 0;
  sampleAngle();
  drawAnglePlot();
}

function updateVisualModel() {
  if (!pendulumGroup) return;
  const p = params();
  const length = p.length * sceneScale;
  const rulerCenterY = (p.pivot - 0.5) * length;
  const bobRadius = (0.11 + Math.sqrt(p.mass) * 0.055) * sceneScale;

  stringMesh.visible = state.mode === "simple";
  bobMesh.visible = state.mode === "simple";
  rodMesh.visible = false;
  bodyMesh.visible = state.mode === "physical";
  comMarker.visible = state.mode === "physical";
  rulerTicks.visible = state.mode === "physical";

  stringMesh.scale.set(1, length, 1);
  stringMesh.position.set(0, -length / 2, 0);
  bobMesh.position.set(0, -length, 0);
  bobMesh.scale.setScalar(bobRadius);

  bodyMesh.position.set(0, rulerCenterY, 0);
  bodyMesh.scale.set(0.17 * sceneScale, length, 0.055 * sceneScale);
  comMarker.position.set(0, rulerCenterY, 0.1);
  updateRulerTicks(length, p.pivot);

  pivotMesh.position.set(0, 0, 0.05);
  updateArc();
  resetTrail();
}

function updateRulerTicks(length, pivotFraction) {
  if (!rulerTicks) return;
  const topY = pivotFraction * length;
  const points = [];
  const tickCount = 10;
  for (let i = 0; i <= tickCount; i += 1) {
    const y = topY - i / tickCount * length;
    const halfWidth = i % 5 === 0 ? 0.115 : 0.075;
    points.push(new THREE.Vector3(-halfWidth, y, 0.13), new THREE.Vector3(halfWidth, y, 0.13));
  }
  rulerTicks.geometry.dispose();
  rulerTicks.geometry = new THREE.BufferGeometry().setFromPoints(points);
}

function updateArc() {
  if (!arcLine) return;
  const p = params();
  const length = Math.min(1.75, p.length) * sceneScale * 0.58;
  const points = [];
  const maxAngle = Math.max(Math.abs(p.initialAngle), Math.abs(state.theta), degToRad(10));
  for (let i = -24; i <= 24; i += 1) {
    const theta = i / 24 * maxAngle;
    points.push(new THREE.Vector3(Math.sin(theta) * length, 1.22 - Math.cos(theta) * length, -0.04));
  }
  arcLine.geometry.dispose();
  arcLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
}

function updateTrailGeometry() {
  if (!trailLine) return;
  trailLine.visible = Boolean(trailToggle?.checked);
  trailLine.geometry.dispose();
  trailLine.geometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
}

function updateTrail() {
  if (!trailLine || !trailToggle?.checked) return;
  const mesh = state.mode === "physical" ? bodyMesh : bobMesh;
  if (!mesh) return;
  pendulumGroup.updateMatrixWorld(true);
  const point = new THREE.Vector3();
  mesh.getWorldPosition(point);
  const lastPoint = trailPoints.at(-1);
  if (!lastPoint || lastPoint.distanceTo(point) > 0.015) {
    trailPoints.push(point);
    if (trailPoints.length > maxTrailPoints) trailPoints.shift();
    updateTrailGeometry();
  }
}

function sampleAngle() {
  angleSamples.push({ t: state.simulationTime, theta: radToDeg(state.theta) });
  if (angleSamples.length > maxAngleSamples) angleSamples.shift();
  const minimumTime = state.simulationTime - graphWindowSeconds;
  while (angleSamples.length > 2 && angleSamples[0].t < minimumTime) angleSamples.shift();
}

function drawAnglePlot() {
  if (!plotCanvas || !plotContext) return;
  const ctx = plotContext;
  const width = plotCanvas.width;
  const height = plotCanvas.height;
  const pad = { left: 42, right: 14, top: 16, bottom: 30 };
  const plotWidth = Math.max(1, width - pad.left - pad.right);
  const plotHeight = Math.max(1, height - pad.top - pad.bottom);
  const latestTime = Math.max(graphWindowSeconds, state.simulationTime);
  const startTime = latestTime - graphWindowSeconds;
  const maxAngle = Math.max(10, number("angle", 18) * 1.18);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#eceff4";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(76, 86, 106, 0.16)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + i / 4 * plotHeight;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  }

  const zeroY = pad.top + plotHeight / 2;
  ctx.strokeStyle = "rgba(94, 129, 172, 0.55)";
  ctx.beginPath();
  ctx.moveTo(pad.left, zeroY);
  ctx.lineTo(width - pad.right, zeroY);
  ctx.stroke();

  ctx.strokeStyle = "#b48ead";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  angleSamples.forEach((sample, index) => {
    const x = pad.left + (sample.t - startTime) / graphWindowSeconds * plotWidth;
    const y = zeroY - sample.theta / maxAngle * (plotHeight / 2);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "#4c566a";
  ctx.font = `${Math.max(11, Math.round(width / 52))}px system-ui, sans-serif`;
  ctx.fillText("+θ", 8, pad.top + 8);
  ctx.fillText("0", 18, zeroY + 4);
  ctx.fillText("-θ", 8, pad.top + plotHeight);
  ctx.fillText("time (s)", width - pad.right - 56, height - 9);

  plotCanvas.dataset.samples = String(angleSamples.length);
  plotCanvas.dataset.latestTheta = String(state.theta);
  plotCanvas.dataset.latestTime = String(state.simulationTime);
}

function angularAcceleration(theta, omega) {
  const p = params();
  if (state.mode === "physical") {
    return -(g * rulerCenterDistance(p) / rulerInertiaPerMass(p)) * Math.sin(theta) - p.damping * omega;
  }
  return -(g / p.length) * Math.sin(theta) - p.damping * omega;
}

function stepPhysics(dt) {
  const clamped = Math.min(dt, 0.032);
  const halfOmega = state.omega + 0.5 * angularAcceleration(state.theta, state.omega) * clamped;
  state.theta += halfOmega * clamped;
  state.omega += angularAcceleration(state.theta, halfOmega) * clamped;
}

function periodEstimate() {
  const p = params();
  if (state.mode === "physical") {
    return 2 * Math.PI * Math.sqrt(rulerInertiaPerMass(p) / (g * rulerCenterDistance(p)));
  }
  return 2 * Math.PI * Math.sqrt(p.length / g);
}

function updateReadouts() {
  const p = params();
  setText(readouts.length, p.length.toFixed(2));
  setText(readouts.mass, p.mass.toFixed(1));
  setText(readouts.angle, String(Math.round(radToDeg(p.initialAngle))));
  setText(readouts.damping, p.damping.toFixed(2));
  setText(readouts.timeScale, p.timeScale.toFixed(2));
  setText(readouts.pivot, String(Math.round(p.pivot * 100)));
  setText(readouts.mode, state.mode === "physical" ? "Physical pendulum" : "Simple pendulum");
  setText(readouts.period, `${format(periodEstimate(), 4)} s`);
  setText(readouts.theta, `${format(radToDeg(state.theta), 4)}°`);
  setText(
    readouts.insight,
    state.mode === "physical"
      ? "ตำแหน่งจุดหมุนเปลี่ยนระยะจาก pivot ถึงศูนย์กลางมวล และเปลี่ยนทั้ง torque กับโมเมนต์ความเฉื่อยของไม้บรรทัด"
      : "มวลเปลี่ยนขนาดภาพ แต่คาบของ simple pendulum ไม่ขึ้นกับมวลในแบบจำลองนี้"
  );
}

function debugState() {
  return {
    mode: state.mode,
    theta: state.theta,
    frame: state.frame,
    running: state.running,
    view: state.view,
    timeScale: params().timeScale,
    pivot: params().pivot,
    period: periodEstimate(),
    trailPoints: trailPoints.length,
    plotSamples: angleSamples.length,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height
  };
}

function publishDebugState() {
  const debug = debugState();
  canvas.dataset.frame = String(debug.frame);
  canvas.dataset.theta = String(debug.theta);
  canvas.dataset.mode = debug.mode;
  canvas.dataset.running = String(debug.running);
  canvas.dataset.view = debug.view;
  canvas.dataset.timeScale = String(debug.timeScale);
  canvas.dataset.pivot = String(debug.pivot);
  canvas.dataset.period = String(debug.period);
  canvas.dataset.trailPoints = String(debug.trailPoints);
  canvas.dataset.plotSamples = String(debug.plotSamples);
  window.pendulumThreeDebugState = debug;
  window.pendulumThreeDebug = () => debugState();
}

function render(time = 0) {
  if (!renderer || !scene || !camera) return;
  const dt = state.lastTime ? (time - state.lastTime) / 1000 : 0;
  state.lastTime = time;
  const effectiveDt = dt * params().timeScale;
  if (state.running) {
    stepPhysics(effectiveDt);
    state.simulationTime += effectiveDt;
    sampleAngle();
  }
  pendulumGroup.rotation.z = state.theta;
  updateTrail();
  updateReadouts();
  updateArc();
  drawAnglePlot();
  positionCamera();
  renderer.render(scene, camera);
  stage?.classList.add("is-ready");
  state.frame += 1;
  state.lastThetaForQa = state.theta;
  publishDebugState();
  window.requestAnimationFrame(render);
}

function setupControls() {
  modeButtons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.pendulumMode));
  });
  viewButtons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.pendulumView));
  });
  Object.entries(controls).forEach(([key, input]) => {
    input?.addEventListener("input", () => {
      if (key === "angle") resetMotion();
      if (key !== "timeScale") {
        updateVisualModel();
        resetAnglePlot();
      }
      updateReadouts();
    });
  });
  trailToggle?.addEventListener("change", () => {
    if (trailToggle.checked) resetTrail();
    updateTrailGeometry();
  });
  resetButton?.addEventListener("click", () => {
    resetMotion();
    resetTrail();
    resetAnglePlot();
    updateVisualModel();
    updateReadouts();
  });
  playButton?.addEventListener("click", () => {
    state.running = !state.running;
    playButton.textContent = state.running ? "หยุดชั่วคราว" : "เล่นต่อ";
    playButton.setAttribute("aria-pressed", String(state.running));
  });
  if (playButton && !state.running) {
    playButton.textContent = "เล่นต่อ";
    playButton.setAttribute("aria-pressed", "false");
  }
  setupCameraDrag();
}

function setupCameraDrag() {
  canvas.addEventListener("pointerdown", (event) => {
    if (state.view !== "inspect") return;
    state.draggingCamera = true;
    state.dragStartX = event.clientX;
    state.dragStartY = event.clientY;
    state.dragStartAzimuth = state.cameraAzimuth;
    state.dragStartElevation = state.cameraElevation;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.draggingCamera) return;
    const dx = event.clientX - state.dragStartX;
    const dy = event.clientY - state.dragStartY;
    state.cameraAzimuth = state.dragStartAzimuth + dx * 0.008;
    state.cameraElevation = clamp(state.dragStartElevation + dy * 0.005, -0.08, 0.7);
    positionCamera();
  });

  canvas.addEventListener("pointerup", (event) => {
    state.draggingCamera = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointercancel", () => {
    state.draggingCamera = false;
  });
}

function init() {
  if (!canvas || !stage) return;
  try {
    setupScene();
    setupControls();
    setMode("simple");
    setView("front");
    new ResizeObserver(resize).observe(stage);
    publishDebugState();
    window.requestAnimationFrame(render);
  } catch (error) {
    if (fallback) fallback.textContent = `ภาพจำลอง Three.js เริ่มทำงานไม่ได้: ${error.message}`;
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
