# Website Performance

The SDD website targets sub-second First Contentful Paint (FCP) on 4G connections. Performance is a core requirement, not an optimization pass.

## Targets

| Metric | Target |
|--------|--------|
| **First Contentful Paint** | < 1.2s |
| **Largest Contentful Paint** | < 1.2s |
| **First Input Delay** | < 50ms |
| **Cumulative Layout Shift** | < 0.05 |
| **Lighthouse Performance** | >= 95 |
| **Lighthouse Accessibility** | >= 95 |
| **Lighthouse Best Practices** | >= 95 |
| **Lighthouse SEO** | >= 95 |

## Bundle Budgets

| Budget | Limit | Contents |
|--------|-------|----------|
| **Critical path** | < 30KB | Fully styled above-the-fold HTML + inlined CSS |
| **Total** | < 150KB | All deferred CSS, interactive JS, font files |

Bundle budgets are enforced in CI via `scripts/check-bundle-budget.mjs`.

## Critical CSS Strategy

**All above-the-fold CSS is inlined in `<head>`.** This includes every style needed to render the hero section pixel-complete: custom properties, typography, colors, backgrounds, convergence visualization, stats bar, nav, badges, buttons.

```text
src/styles/
├── critical.css      # 496 lines — inlined above-the-fold
├── tokens.css        # 88 lines — design system tokens (part of critical)
└── walkthrough.css   # 345 lines — deferred below-the-fold
```

**Zero render-blocking `<link rel="stylesheet">` tags in `<head>`.** The inlined CSS is the only CSS before first paint.

### Deferred CSS Loading

Below-the-fold CSS loads via preload pattern:

```html
<link rel="preload" href="walkthrough.css" as="style"
      onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="walkthrough.css"></noscript>
```

## Font Loading

**Strategy:** Explicit FOUT (Flash of Unstyled Text). System fonts render immediately. Web fonts swap in when available.

**Fonts:**
- **Outfit** (body) -- weights 300, 400, 500, 600, 700 as separate files. Only 400 and 600 in critical path.
- **JetBrains Mono** (code) -- weights 400 and 500 only.

**Rules:**
- `font-display: swap` on all `@font-face` declarations
- Self-hosted, subset to Latin + Latin Extended (no Google Fonts CDN)
- Fonts are **not** preloaded -- they load via CSS cascade after deferred stylesheet applies
- `size-adjust`, `ascent-override`, `descent-override` to minimize CLS on swap

**System fallback stacks:**
- Body: `'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Code: `'JetBrains Mono', 'SF Mono', 'Cascadia Code', 'Consolas', monospace`

## Image Optimization

**Every image uses `<picture>` elements with:**

1. **Format negotiation** -- AVIF > WebP > JPEG/PNG fallback
2. **DPI-specific `srcset`** -- 1x, 2x, 3x variants
3. **LQIP (Low-Quality Image Placeholder)** -- 32px wide, JPEG quality 20, ~200-500 bytes

**Progressive loading flow:**
1. LQIP renders immediately with `filter: blur(10px)`
2. Full-quality image loads in background
3. When loaded, opacity fade (200ms) replaces placeholder
4. Blur filter removed

**Build pipeline:** Source images stored as high-res originals. Astro/sharp generates all variants at build time. No runtime image processing.

## JavaScript Strategy

- **Astro island architecture** -- JS only ships for interactive components
- **Zero JS by default** -- static pages have no JavaScript
- **Deferred loading** -- interactive islands hydrate after first paint
- **JS-required components:** Walkthrough, LineageTimeline only
