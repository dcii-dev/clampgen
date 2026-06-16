# Medium Article Draft

Target URL: https://clampgen.com

**Why Medium:** DA ~95, articles index on Google independently, no link rules, works for any niche.
Publish under a personal or brand account. Add the article to a relevant publication (e.g., "JavaScript in Plain English", "Level Up Coding", "UX Collective") for extra reach.

---

## Article: Stop Writing Font-Size Media Queries. Use CSS clamp() Instead.

**Suggested tags:** CSS, Web Development, Frontend Development, Typography, Design Systems

---

If you are still managing responsive typography with a stack of `@media` breakpoints, there is a better way. One line of CSS that handles every viewport width, no breakpoints required.

### The Old Approach

```css
h1 {
  font-size: 2rem;
}

@media (min-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }
}

@media (min-width: 1200px) {
  h1 {
    font-size: 3rem;
  }
}
```

This works, but it has problems:

- Three declarations to manage per element
- The transition between sizes is abrupt, not fluid
- Add a new heading level and you triple the work
- The numbers are usually guessed, not calculated

### The clamp() Approach

```css
h1 {
  font-size: clamp(2rem, 1.5rem + 2.5vw, 3rem);
}
```

`clamp()` takes three values:

1. **Minimum** — the smallest the font will ever be
2. **Preferred** — a fluid expression that scales with the viewport
3. **Maximum** — the largest the font will ever be

The browser handles the interpolation. No breakpoints. No abrupt jumps.

### How the Middle Value Works

The preferred value is a `vw` expression — a percentage of the viewport width. The formula to calculate a precise value:

```
slope = (max-size - min-size) / (max-viewport - min-viewport)
preferred = slope * 100vw + (min-size - slope * min-viewport)
```

Example: body text that scales from 16px at 320px viewport to 18px at 1920px viewport.

- Slope: (18 - 16) / (1920 - 320) = 0.00125
- vw: 0.125vw
- Offset: 16 - (0.00125 × 320) = 15.6px ≈ 0.975rem

Result:

```css
font-size: clamp(1rem, 0.975rem + 0.125vw, 1.125rem);
```

### The Full Type Scale

Doing this for every heading level by hand is tedious. The better approach: define a modular ratio, then apply `clamp()` consistently across all levels.

**Major Third (1.25 ratio), 16px base, 320-1920px viewport:**

```css
body {
  font-size: clamp(1rem, 0.975rem + 0.125vw, 1.125rem);
}
h5 {
  font-size: clamp(1.25rem, 1.217rem + 0.163vw, 1.406rem);
}
h4 {
  font-size: clamp(1.563rem, 1.521rem + 0.208vw, 1.758rem);
}
h3 {
  font-size: clamp(1.953rem, 1.902rem + 0.256vw, 2.197rem);
}
h2 {
  font-size: clamp(2.441rem, 2.377rem + 0.32vw, 2.747rem);
}
h1 {
  font-size: clamp(3.052rem, 2.972rem + 0.4vw, 3.433rem);
}
```

Every level scales proportionally. Consistent rhythm at any viewport width.

[ClampGen](https://clampgen.com) generates this entire scale from four inputs: base size, min viewport, max viewport, and modular ratio. It also supports container query units (`cqw`) for fluid type inside components rather than based on viewport width.

### Container Queries

If you are building a design system where components need to scale based on their container rather than the page width, swap `vw` for `cqw`:

```css
.card h2 {
  font-size: clamp(1.25rem, 1rem + 2cqw, 1.75rem);
}
```

Same math, different reference point. ClampGen handles the unit selection.

### Browser Support

`clamp()` has been supported in all major browsers since 2020 (Chrome 79, Firefox 75, Safari 13.1). For older browser fallbacks, declare a static `font-size` on the line above — browsers that do not understand `clamp()` will use the fallback:

```css
h1 {
  font-size: 2.5rem; /* fallback */
  font-size: clamp(2rem, 1.5rem + 2.5vw, 3rem);
}
```

### When Not to Use clamp()

`clamp()` is not always the right tool:

- **Very small components** where size should stay fixed regardless of viewport — use `rem`
- **Print stylesheets** — use `pt` or `mm`
- **User-scalable interfaces** (e.g., browser zoom considerations) — test carefully, `vw` does not respond to browser zoom in all implementations

For everything else — headings, body text, spacing, padding — fluid `clamp()` values replace a whole layer of media query maintenance.

---

The math is the only barrier. Handle it once with the right tool and move on.

---

## Notes on Publishing

- Aim for 600-900 words published (trim if needed)
- Submit to "JavaScript in Plain English", "Level Up Coding", or "UX Collective" for editorial reach
- Add a canonical tag pointing to clampgen.com if Medium allows it (reduces duplicate content risk)
- One article per asset is enough — do not publish variations of the same piece
