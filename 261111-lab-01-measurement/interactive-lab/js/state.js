const STORAGE_KEY = "lab01-measurement-state-v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getValue(state, path, fallback = "") {
  return path.split(".").reduce((current, key) => {
    if (current && Object.prototype.hasOwnProperty.call(current, key)) {
      return current[key];
    }
    return fallback;
  }, state);
}

export function setValue(state, path, value) {
  const parts = path.split(".");
  let cursor = state;
  parts.slice(0, -1).forEach((part) => {
    if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
    cursor = cursor[part];
  });
  cursor[parts[parts.length - 1]] = value;
  saveState(state);
  return state;
}

export function exportStateFile(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "lab-01-measurement-worksheet.json";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function importStateFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const state = JSON.parse(String(reader.result || "{}"));
        saveState(state);
        resolve(state);
      } catch (error) {
        reject(error);
      }
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsText(file);
  });
}
