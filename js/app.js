(function () {
  "use strict";

  const DEFAULT_BASE_FONT_SIZE = 16;

  /**
   * Reads the user-defined root font size from the input, falling back to 16.
   * @return {number}
   */
  function getBaseFontSize() {
    const el = document.getElementById("root-font-size");
    const val = el ? parseFloat(el.value) : DEFAULT_BASE_FONT_SIZE;
    return val > 0 ? val : DEFAULT_BASE_FONT_SIZE;
  }

  /**
   * Converts pixels to rem using the current base font size.
   * @param {number} px
   * @return {number}
   */
  function pxToRem(px) {
    return px / getBaseFontSize();
  }

  /**
   * Converts rem to pixels using the current base font size.
   * @param {number} rem
   * @return {number}
   */
  function remToPx(rem) {
    return rem * getBaseFontSize();
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
   * @param {number} minViewport - Min viewport/container width in px.
   * @param {number} maxViewport - Max viewport/container width in px.
   * @param {number} minSize - Min size in the chosen unit.
   * @param {number} maxSize - Max size in the chosen unit.
   * @param {string} unit - 'rem', 'px', or 'unitless'.
   * @param {string} [relativeUnit='vw'] - 'vw' or 'cqw'.
   * @return {{css: string, slope: number, interceptPx: number, preferred: string, minRem: number, maxRem: number, unitless: boolean}}
   */
  function generateClamp(
    property,
    minViewport,
    maxViewport,
    minSize,
    maxSize,
    unit,
    relativeUnit,
  ) {
    if (!relativeUnit) {
      relativeUnit = "vw";
    }

    const isUnitless = unit === "unitless";

    if (isUnitless) {
      const slope = (maxSize - minSize) / (maxViewport - minViewport);
      const intercept = minSize - slope * minViewport;

      const slopeVw = round(slope * 100, 4);
      const interceptRounded = round(intercept, 4);

      const preferred = `${interceptRounded} + ${slopeVw}${relativeUnit}`;
      const css = `${property}: clamp(${round(minSize, 4)}, ${preferred}, ${round(maxSize, 4)});`;
      const comment = `/* ${round(minSize, 4)} at ${minViewport}px ${relativeUnit === "cqw" ? "container" : "viewport"} → ${round(maxSize, 4)} at ${maxViewport}px ${relativeUnit === "cqw" ? "container" : "viewport"} */`;

      return {
        css,
        comment,
        slope: round(slope, 6),
        interceptPx: round(intercept, 4),
        preferred,
        minRem: round(minSize, 4),
        maxRem: round(maxSize, 4),
        unitless: true,
      };
    }

    const minPx = unit === "rem" ? remToPx(minSize) : minSize;
    const maxPx = unit === "rem" ? remToPx(maxSize) : maxSize;

    const slope = (maxPx - minPx) / (maxViewport - minViewport);
    const interceptPx = minPx - slope * minViewport;

    const slopeVw = round(slope * 100, 4);

    if (unit === "px") {
      const interceptRounded = round(interceptPx, 4);
      const preferred = `${interceptRounded}px + ${slopeVw}${relativeUnit}`;
      const css = `${property}: clamp(${round(minPx, 4)}px, ${preferred}, ${round(maxPx, 4)}px);`;
      const context = relativeUnit === "cqw" ? "container" : "viewport";
      const comment = `/* ${round(minPx, 4)}px at ${minViewport}px ${context} → ${round(maxPx, 4)}px at ${maxViewport}px ${context} */`;

      return {
        css,
        comment,
        slope: round(slope, 6),
        interceptPx: round(interceptPx, 4),
        preferred,
        minRem: round(minPx, 4),
        maxRem: round(maxPx, 4),
        unitless: false,
        outputUnit: "px",
      };
    }

    const interceptRem = round(pxToRem(interceptPx), 4);
    const minRem = unit === "rem" ? minSize : round(pxToRem(minPx), 4);
    const maxRem = unit === "rem" ? maxSize : round(pxToRem(maxPx), 4);

    const preferred = `${interceptRem}rem + ${slopeVw}${relativeUnit}`;
    const css = `${property}: clamp(${minRem}rem, ${preferred}, ${maxRem}rem);`;
    const context = relativeUnit === "cqw" ? "container" : "viewport";
    const comment = `/* ${round(minPx, 4)}px at ${minViewport}px ${context} → ${round(maxPx, 4)}px at ${maxViewport}px ${context} */`;

    return {
      css,
      comment,
      slope: round(slope, 6),
      interceptPx: round(interceptPx, 4),
      preferred,
      minRem,
      maxRem,
      minPx: round(minPx, 4),
      maxPx: round(maxPx, 4),
      unitless: false,
      outputUnit: "rem",
    };
  }

  /**
   * Reads, validates, and returns the current form values.
   * @return {{property: string, minViewport: number, maxViewport: number, minSize: number, maxSize: number, unit: string, relativeUnit: string} | null}
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
    const checkedRelative = document.querySelector(
      'input[name="relative-to"]:checked',
    );
    const relativeUnit = checkedRelative ? checkedRelative.value : "vw";

    const property =
      propertySelect.value === "custom"
        ? customPropertyInput?.value.trim() || "property"
        : propertySelect.value;

    const isLineHeight = property === "line-height";
    const effectiveUnit = isLineHeight ? "unitless" : unit;

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

    return {
      property,
      minViewport,
      maxViewport,
      minSize,
      maxSize,
      unit: effectiveUnit,
      relativeUnit,
    };
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
      inputs.relativeUnit,
    );

    outputEl.innerHTML = `<span class="results__comment">${result.comment}</span>\n${result.css}`;

    const context = inputs.relativeUnit === "cqw" ? "container" : "viewport";
    const suffix = result.unitless ? "" : result.outputUnit || "rem";
    document.getElementById("breakdown-min").textContent =
      `${result.minRem}${suffix}`;
    document.getElementById("breakdown-max").textContent =
      `${result.maxRem}${suffix}`;
    document.getElementById("breakdown-slope").textContent = result.unitless
      ? `${result.slope} (unitless change per px of ${context})`
      : `${result.slope} (px change per px of ${context})`;
    document.getElementById("breakdown-intercept").textContent = result.unitless
      ? `${result.interceptPx} (unitless)`
      : `${result.interceptPx}px`;
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
   * Updates viewport/container labels and hints based on the relative-to selection.
   * @param {string} relativeUnit - 'vw' or 'cqw'.
   */
  function updateRelativeLabels(relativeUnit) {
    const isContainer = relativeUnit === "cqw";
    const minLabel = document.querySelector('label[for="min-viewport"]');
    const maxLabel = document.querySelector('label[for="max-viewport"]');
    const minHint = document.getElementById("min-viewport-hint");
    const maxHint = document.getElementById("max-viewport-hint");

    if (minLabel) {
      minLabel.textContent = isContainer ? "Min Container" : "Min Viewport";
    }
    if (maxLabel) {
      maxLabel.textContent = isContainer ? "Max Container" : "Max Viewport";
    }
    if (minHint) {
      minHint.textContent = isContainer
        ? "Smallest container width."
        : "Smallest screen width.";
    }
    if (maxHint) {
      maxHint.textContent = isContainer
        ? "Largest container width."
        : "Largest screen width.";
    }
  }

  /**
   * Shows or hides the root font size input based on the selected unit.
   * @param {string} unit - 'rem' or 'px'.
   */
  function updateRootFontSizeVisibility(unit) {
    const group = document.getElementById("root-font-size-group");
    if (group) {
      group.hidden = unit === "px";
    }
  }

  /**
   * Applies a size preset from a preset button's data attributes.
   * @param {HTMLButtonElement} btn
   */
  function applyPreset(btn) {
    const { minSize, maxSize, unit, property } = btn.dataset;

    document.getElementById("min-size").value = minSize;
    document.getElementById("max-size").value = maxSize;

    if (unit === "unitless") {
      const remRadio = document.querySelector(
        'input[name="unit"][value="rem"]',
      );
      if (remRadio) {
        remRadio.checked = true;
      }
      updateUnitLabels("unitless");
    } else {
      const unitRadio = document.querySelector(
        `input[name="unit"][value="${unit}"]`,
      );
      if (unitRadio) {
        unitRadio.checked = true;
        updateUnitLabels(unit);
      }
    }

    if (property) {
      const propertySelect = document.getElementById("css-property");
      const customPropertyGroup = document.getElementById(
        "custom-property-group",
      );
      propertySelect.value = property;
      customPropertyGroup.hidden = true;
    }

    updateOutput();
  }

  /**
   * Handles the copy to clipboard action for the results panel.
   */
  function handleCopy() {
    const outputEl = document.getElementById("clamp-output");
    const copyBtn = document.getElementById("copy-btn");
    const text = outputEl.textContent.trim();

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
   * Generates a full type scale from body text sizes and a ratio.
   * @param {number} bodyMinPx - Body text min size in px.
   * @param {number} bodyMaxPx - Body text max size in px.
   * @param {number} ratio - The scale ratio multiplier.
   * @param {number} minViewport - Min viewport/container in px.
   * @param {number} maxViewport - Max viewport/container in px.
   * @param {Array<{label: string, step: number}>} levels - Heading levels to generate.
   * @param {string} [relativeUnit='vw'] - 'vw' or 'cqw'.
   * @return {Array<{label: string, css: string}>}
   */
  function generateTypeScale(
    bodyMinPx,
    bodyMaxPx,
    ratio,
    minViewport,
    maxViewport,
    levels,
    relativeUnit,
  ) {
    const results = [];

    for (const level of levels) {
      const minPx = bodyMinPx * Math.pow(ratio, level.step);
      const maxPx = bodyMaxPx * Math.pow(ratio, level.step);
      const minRem = round(pxToRem(minPx), 4);
      const maxRem = round(pxToRem(maxPx), 4);

      const result = generateClamp(
        "font-size",
        minViewport,
        maxViewport,
        minRem,
        maxRem,
        "rem",
        relativeUnit,
      );

      results.push({
        label: level.label,
        css: result.css,
        minPx: round(minPx, 2),
        maxPx: round(maxPx, 2),
      });
    }

    return results;
  }

  /**
   * Reads the type scale form inputs and renders the scale output.
   */
  function handleGenerateScale() {
    const bodyMinPx = parseFloat(
      document.getElementById("scale-body-min").value,
    );
    const bodyMaxPx = parseFloat(
      document.getElementById("scale-body-max").value,
    );
    const ratio = parseFloat(document.getElementById("scale-ratio").value);
    const minViewport = parseFloat(
      document.getElementById("min-viewport").value,
    );
    const maxViewport = parseFloat(
      document.getElementById("max-viewport").value,
    );

    if (
      isNaN(bodyMinPx) ||
      isNaN(bodyMaxPx) ||
      isNaN(ratio) ||
      isNaN(minViewport) ||
      isNaN(maxViewport) ||
      bodyMinPx <= 0 ||
      bodyMaxPx < bodyMinPx ||
      minViewport <= 0 ||
      maxViewport <= minViewport
    ) {
      return;
    }

    const checkboxes = document.querySelectorAll(
      "#scale-levels-fieldset input[type='checkbox']",
    );
    const levels = [{ label: "body", step: 0 }];

    checkboxes.forEach((cb) => {
      if (cb.checked && cb.dataset.step) {
        levels.push({ label: cb.value, step: parseInt(cb.dataset.step, 10) });
      }
    });

    const checkedRelative = document.querySelector(
      'input[name="relative-to"]:checked',
    );
    const relativeUnit = checkedRelative ? checkedRelative.value : "vw";

    const scale = generateTypeScale(
      bodyMinPx,
      bodyMaxPx,
      ratio,
      minViewport,
      maxViewport,
      levels,
      relativeUnit,
    );

    const resultsEl = document.getElementById("scale-results");
    const outputEl = document.getElementById("scale-output");

    const ratioSelect = document.getElementById("scale-ratio");
    const ratioName =
      ratioSelect.options[ratioSelect.selectedIndex].textContent;
    const context = relativeUnit === "cqw" ? "container" : "viewport";
    const headerComment = `/* Type Scale: ${ratioName} — ${bodyMinPx}px → ${bodyMaxPx}px body at ${minViewport}px → ${maxViewport}px ${context} */`;

    let html = `<span class="scale-results__comment">${headerComment}</span>\n`;
    for (const item of scale) {
      const lineComment = `/* ${item.minPx}px \u2192 ${item.maxPx}px */`;
      html += `<span class="scale-results__line"><span class="scale-results__selector">${item.label}</span> { ${item.css} } <span class="scale-results__line-comment">${lineComment}</span></span>\n`;
    }

    outputEl.innerHTML = html;
    resultsEl.hidden = false;
  }

  /**
   * Handles the "Copy All" button for the type scale output.
   */
  function handleCopyAll() {
    const outputEl = document.getElementById("scale-output");
    const copyAllBtn = document.getElementById("copy-all-btn");

    const text = outputEl.textContent.trim();

    navigator.clipboard.writeText(text).then(() => {
      copyAllBtn.textContent = "Copied!";
      copyAllBtn.classList.add("results__copy-btn--copied");
      copyAllBtn.setAttribute("aria-label", "Copied to clipboard");

      setTimeout(() => {
        copyAllBtn.textContent = "Copy All";
        copyAllBtn.classList.remove("results__copy-btn--copied");
        copyAllBtn.setAttribute(
          "aria-label",
          "Copy all generated CSS to clipboard",
        );
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
      const isLineHeight = propertySelect.value === "line-height";
      customPropertyGroup.hidden = !isCustom;

      if (isCustom) {
        document.getElementById("custom-property").focus();
      }

      if (isLineHeight) {
        updateUnitLabels("unitless");
      } else {
        const checkedUnit = document.querySelector(
          'input[name="unit"]:checked',
        );
        updateUnitLabels(checkedUnit ? checkedUnit.value : "rem");
      }

      updateOutput();
    });

    unitRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        updateUnitLabels(radio.value);
        updateRootFontSizeVisibility(radio.value);
      });
    });

    const relativeRadios = document.querySelectorAll(
      'input[name="relative-to"]',
    );
    relativeRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        updateRelativeLabels(radio.value);
        updateOutput();
      });
    });

    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => applyPreset(btn));
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", handleCopy);
    }

    const generateScaleBtn = document.getElementById("generate-scale-btn");
    const copyAllBtn = document.getElementById("copy-all-btn");

    if (generateScaleBtn) {
      generateScaleBtn.addEventListener("click", handleGenerateScale);
    }

    if (copyAllBtn) {
      copyAllBtn.addEventListener("click", handleCopyAll);
    }
  }

  if (document.readyState === "complete") {
    initializeApp();
  } else {
    window.addEventListener("load", initializeApp, { once: true });
  }
})();
