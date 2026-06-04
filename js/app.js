(function () {
  "use strict";

  const BASE_FONT_SIZE_PX = 16;

  /**
   * Converts pixels to rem.
   * @param {number} px
   * @return {number}
   */
  function pxToRem(px) {
    return px / BASE_FONT_SIZE_PX;
  }

  /**
   * Converts rem to pixels.
   * @param {number} rem
   * @return {number}
   */
  function remToPx(rem) {
    return rem * BASE_FONT_SIZE_PX;
  }

  /**
   * Rounds a number to a given number of decimal places.
   * @param {number} value
   * @param {number} decimals
   * @return {number}
   */
  function round(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * Generates a CSS clamp() declaration from the given parameters.
   * @param {string} property - The CSS property name.
   * @param {number} minViewport - Min viewport width in px.
   * @param {number} maxViewport - Max viewport width in px.
   * @param {number} minSize - Min size in the chosen unit.
   * @param {number} maxSize - Max size in the chosen unit.
   * @param {string} unit - 'rem' or 'px'.
   * @return {{css: string, slope: number, interceptPx: number, preferred: string, minRem: number, maxRem: number}}
   */
  function generateClamp(
    property,
    minViewport,
    maxViewport,
    minSize,
    maxSize,
    unit,
  ) {
    const minPx = unit === "rem" ? remToPx(minSize) : minSize;
    const maxPx = unit === "rem" ? remToPx(maxSize) : maxSize;

    const slope = (maxPx - minPx) / (maxViewport - minViewport);
    const interceptPx = minPx - slope * minViewport;

    const slopeVw = round(slope * 100, 4);
    const interceptRem = round(pxToRem(interceptPx), 4);
    const minRem = unit === "rem" ? minSize : round(pxToRem(minPx), 4);
    const maxRem = unit === "rem" ? maxSize : round(pxToRem(maxPx), 4);

    const preferred = `${interceptRem}rem + ${slopeVw}vw`;
    const css = `${property}: clamp(${minRem}rem, ${preferred}, ${maxRem}rem);`;

    return {
      css,
      slope: round(slope, 6),
      interceptPx: round(interceptPx, 4),
      preferred,
      minRem,
      maxRem,
    };
  }

  /**
   * Reads, validates, and returns the current form values.
   * @return {{property: string, minViewport: number, maxViewport: number, minSize: number, maxSize: number, unit: string} | null}
   */
  function getInputs() {
    const propertySelect = document.getElementById("css-property");
    const customPropertyInput = document.getElementById("custom-property");
    const minViewport = parseFloat(
      document.getElementById("min-viewport").value,
    );
    const maxViewport = parseFloat(
      document.getElementById("max-viewport").value,
    );
    const minSize = parseFloat(document.getElementById("min-size").value);
    const maxSize = parseFloat(document.getElementById("max-size").value);
    const checkedUnit = document.querySelector('input[name="unit"]:checked');
    const unit = checkedUnit ? checkedUnit.value : "rem";

    const property =
      propertySelect.value === "custom"
        ? customPropertyInput?.value.trim() || "property"
        : propertySelect.value;

    if (
      isNaN(minViewport) ||
      isNaN(maxViewport) ||
      isNaN(minSize) ||
      isNaN(maxSize) ||
      minViewport <= 0 ||
      maxViewport <= minViewport ||
      minSize < 0 ||
      maxSize < minSize
    ) {
      return null;
    }

    return { property, minViewport, maxViewport, minSize, maxSize, unit };
  }

  /**
   * Updates the output display and the calculation breakdown panel.
   */
  function updateOutput() {
    const outputEl = document.getElementById("clamp-output");
    const inputs = getInputs();

    if (!inputs) {
      outputEl.textContent =
        "/* Invalid input — max values must be greater than min values. */";
      return;
    }

    const result = generateClamp(
      inputs.property,
      inputs.minViewport,
      inputs.maxViewport,
      inputs.minSize,
      inputs.maxSize,
      inputs.unit,
    );

    outputEl.textContent = result.css;

    document.getElementById("breakdown-min").textContent =
      `${result.minRem}rem`;
    document.getElementById("breakdown-max").textContent =
      `${result.maxRem}rem`;
    document.getElementById("breakdown-slope").textContent =
      `${result.slope} (px change per px of viewport)`;
    document.getElementById("breakdown-intercept").textContent =
      `${result.interceptPx}px`;
    document.getElementById("breakdown-preferred").textContent =
      result.preferred;
  }

  /**
   * Updates the unit suffix labels next to the size inputs.
   * @param {string} unit
   */
  function updateUnitLabels(unit) {
    const minLabel = document.getElementById("size-unit-min");
    const maxLabel = document.getElementById("size-unit-max");
    if (minLabel) minLabel.textContent = unit;
    if (maxLabel) maxLabel.textContent = unit;
  }

  /**
   * Applies a size preset from a preset button's data attributes.
   * @param {HTMLButtonElement} btn
   */
  function applyPreset(btn) {
    const { minSize, maxSize, unit } = btn.dataset;

    document.getElementById("min-size").value = minSize;
    document.getElementById("max-size").value = maxSize;

    const unitRadio = document.querySelector(
      `input[name="unit"][value="${unit}"]`,
    );
    if (unitRadio) {
      unitRadio.checked = true;
      updateUnitLabels(unit);
    }

    updateOutput();
  }

  /**
   * Handles the copy to clipboard action for the results panel.
   */
  function handleCopy() {
    const outputEl = document.getElementById("clamp-output");
    const copyBtn = document.getElementById("copy-btn");
    const text = outputEl.textContent;

    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("results__copy-btn--copied");
      copyBtn.setAttribute("aria-label", "Copied to clipboard");

      setTimeout(() => {
        copyBtn.textContent = "Copy";
        copyBtn.classList.remove("results__copy-btn--copied");
        copyBtn.setAttribute("aria-label", "Copy generated CSS to clipboard");
      }, 2000);
    });
  }

  /**
   * Sets the footer copyright year to the current year.
   */
  function setFooterYear() {
    const yearEl = document.getElementById("footer-year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /**
   * Applies a theme to the document and updates the toggle button state.
   * @param {"light"|"dark"} theme
   */
  function applyTheme(theme) {
    const btn = document.getElementById("theme-toggle");
    document.documentElement.setAttribute("data-theme", theme);

    if (btn) {
      const isDark = theme === "dark";
      btn.setAttribute("aria-pressed", String(isDark));
      btn.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode",
      );
    }
  }

  /**
   * Initializes the theme from localStorage, falling back to the
   * user's OS preference, then light mode.
   */
  function initializeTheme() {
    const stored = localStorage.getItem("clampgen-theme");

    if (stored === "dark" || stored === "light") {
      applyTheme(stored);
      return;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  /**
   * Toggles between light and dark mode and persists the choice.
   */
  function toggleTheme() {
    const current =
      document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("clampgen-theme", next);
  }

  /**
   * Initializes all event listeners and runs the initial output calculation.
   */
  function initializeApp() {
    const form = document.getElementById("clamp-form");
    const copyBtn = document.getElementById("copy-btn");
    const themeToggleBtn = document.getElementById("theme-toggle");
    const propertySelect = document.getElementById("css-property");
    const customPropertyGroup = document.getElementById(
      "custom-property-group",
    );
    const unitRadios = document.querySelectorAll('input[name="unit"]');
    const presetBtns = document.querySelectorAll(".presets__btn");

    if (!form) return;

    setFooterYear();
    initializeTheme();
    updateOutput();

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", toggleTheme);
    }

    form.addEventListener("input", updateOutput);

    propertySelect.addEventListener("change", () => {
      const isCustom = propertySelect.value === "custom";
      customPropertyGroup.hidden = !isCustom;

      if (isCustom) {
        document.getElementById("custom-property").focus();
      }

      updateOutput();
    });

    unitRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        updateUnitLabels(radio.value);
      });
    });

    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => applyPreset(btn));
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", handleCopy);
    }
  }

  if (document.readyState === "complete") {
    initializeApp();
  } else {
    window.addEventListener("load", initializeApp, { once: true });
  }
})();
