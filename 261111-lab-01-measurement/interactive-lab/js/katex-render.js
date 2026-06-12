export function renderMath(root = document.body) {
  if (!window.renderMathInElement) return;
  if (!root || root.dataset.mathRendered === "true") return;

  window.renderMathInElement(root, {
    delimiters: [
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
      { left: "$$", right: "$$", display: true }
    ],
    throwOnError: false,
    strict: "warn",
    trust: false,
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
  });

  root.dataset.mathRendered = "true";
}
