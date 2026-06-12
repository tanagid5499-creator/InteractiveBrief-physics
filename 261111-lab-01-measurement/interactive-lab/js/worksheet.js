import {
  average,
  cylinderVolumeCm3,
  formatNumber,
  percentDifference,
  percentError,
  toNumber,
  wireAreaMm2
} from "./math-utils.js";
import {
  clearState,
  exportStateFile,
  getValue,
  importStateFile,
  loadState,
  saveState,
  setValue
} from "./state.js";

let worksheetState = {};

function keyForInput(input, index) {
  const table = input.closest("table[data-group]");
  const row = input.closest("tr[data-row]");
  if (!table || !row) return input.dataset.store || "";
  return `tables.${table.dataset.group}.${row.dataset.row}.${index}`;
}

function tableInputs() {
  return Array.from(document.querySelectorAll("table[data-group] tbody tr[data-row]")).flatMap((row) => {
    return Array.from(row.querySelectorAll("input")).map((input, index) => ({ input, key: keyForInput(input, index) }));
  });
}

function storedInputs() {
  return Array.from(document.querySelectorAll("[data-store]")).map((input) => ({ input, key: input.dataset.store }));
}

function bindPersistence() {
  [...storedInputs(), ...tableInputs()].forEach(({ input, key }) => {
    input.value = getValue(worksheetState, key, "");
    input.addEventListener("input", () => {
      setValue(worksheetState, key, input.value);
      calculateWorksheet();
    });
  });
}

function rowValues(group, row) {
  return [0, 1, 2].map((index) => getValue(worksheetState, `tables.${group}.${row}.${index}`, ""));
}

function rowAverage(group, row) {
  return average(rowValues(group, row));
}

function updateTableAverages() {
  document.querySelectorAll("table[data-group] tbody tr[data-row]").forEach((row) => {
    const group = row.closest("table").dataset.group;
    const avg = rowAverage(group, row.dataset.row);
    const output = row.querySelector("[data-average]");
    if (output) output.textContent = formatNumber(avg, group === "micro" ? 3 : 2);
  });
}

function setOutput(id, value, digits = 3, unit = "") {
  const output = document.getElementById(id);
  if (output) output.textContent = formatNumber(value, digits, unit);
}

export function calculateWorksheet() {
  updateTableAverages();

  const rulerDiameter = rowAverage("ruler", "diameter");
  const rulerCircumference = rowAverage("ruler", "circumference");
  const rulerThickness = rowAverage("ruler", "thickness");
  const rulerPi = rulerDiameter ? rulerCircumference / rulerDiameter : null;
  setOutput("rulerPiOutput", rulerPi, 4);
  setOutput("rulerErrorOutput", percentError(rulerPi), 2, "%");

  const vernierS = toNumber(getValue(worksheetState, "vernier.s"));
  const vernierN = toNumber(getValue(worksheetState, "vernier.n"));
  const vernierResolution = vernierS !== null && vernierN ? vernierS / vernierN : null;
  setOutput("vernierResolutionOutput", vernierResolution, 4, "mm");

  const inner = rowAverage("vernier", "innerDiameter");
  const outer = rowAverage("vernier", "outerDiameter");
  const height = rowAverage("vernier", "height");
  const outerCircumference = rowAverage("vernier", "outerCircumference");
  const vernierPi = outer ? outerCircumference / outer : null;
  const volume = cylinderVolumeCm3(inner, outer, height);
  const mass = toNumber(getValue(worksheetState, "vernier.mass"));
  const density = mass !== null && volume ? mass / volume : null;
  setOutput("vernierPiOutput", vernierPi, 4);
  setOutput("cylinderVolumeOutput", volume, 3, "cm³");
  setOutput("densityOutput", density, 3, "g/cm³");

  const microP = toNumber(getValue(worksheetState, "micro.p"));
  const microN = toNumber(getValue(worksheetState, "micro.n"));
  const microResolution = microP !== null && microN ? microP / microN : null;
  setOutput("microResolutionOutput", microResolution, 4, "mm");

  const wire = rowAverage("micro", "wire");
  const ringMicro = rowAverage("micro", "ring");
  setOutput("wireAreaOutput", wireAreaMm2(wire), 4, "mm²");
  setOutput("ringDifferenceOutput", percentDifference(ringMicro, rulerThickness), 2, "%");
}

function resetWorksheet() {
  clearState();
  worksheetState = {};
  [...storedInputs(), ...tableInputs()].forEach(({ input }) => {
    input.value = "";
  });
  calculateWorksheet();
}

async function handleImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    worksheetState = await importStateFile(file);
    [...storedInputs(), ...tableInputs()].forEach(({ input, key }) => {
      input.value = getValue(worksheetState, key, "");
    });
    calculateWorksheet();
  } catch {
    alert("Import JSON failed. Please check the file.");
  } finally {
    event.target.value = "";
  }
}

export function initWorksheet() {
  worksheetState = loadState();
  bindPersistence();
  calculateWorksheet();

  document.getElementById("calculateButton")?.addEventListener("click", calculateWorksheet);
  document.getElementById("clearWorksheetButton")?.addEventListener("click", resetWorksheet);
  document.getElementById("resetDataButton")?.addEventListener("click", resetWorksheet);
  document.getElementById("resetDataButtonBottom")?.addEventListener("click", resetWorksheet);
  document.getElementById("exportJsonButton")?.addEventListener("click", () => exportStateFile(worksheetState));
  document.getElementById("exportJsonButtonBottom")?.addEventListener("click", () => exportStateFile(worksheetState));
  document.getElementById("importJsonInput")?.addEventListener("change", handleImport);
  document.getElementById("importJsonInputBottom")?.addEventListener("change", handleImport);

  window.addEventListener("beforeunload", () => saveState(worksheetState));
}
