# PRD — Signal-Driven Development Website

> **Product**: SDD Methodology Reference Site
> **Owner**: Michael Dyer (listenrightmeow)
> **Version**: 0.1 (Draft)
> **Date**: March 21, 2026
> **Status**: Requirements Gathering

---

## 1. Purpose

The SDD website is the methodology's public presence — the storefront for a community contribution. It converts curiosity from the blog series into hands-on experience with the methodology, and establishes SDD as a credible, rigorous extension of DDD.

The site is not a product page. It does not mention Complai, Sift, or any commercial product. It is the Brandolini model: give away the methodology, build authority, let the platform sell itself later.

### 1.1 Success Criteria

- An architect who reads Post 4 and visits the site leaves having *experienced* a gap report, not just read about one
- The interactive walkthrough is the primary conversion mechanism: curiosity → understanding → "let me try this on my domain" → repo
- The DDD community perceives SDD as a serious, well-crafted contribution — not a marketing page with a methodology name stapled on
- The site ranks for "domain driven design definition of done," "DDD gap report," "signal driven development," and related long-tail queries within 90 days

### 1.2 Non-Goals

- No product promotion, pricing, or sign-up flows
- No user accounts, authentication, or data collection beyond analytics
- No server-side rendering requirements — this is a static site
- Not a documentation site (that's the repo's job) — this is an experience

---

## 2. Audience

**Primary**: Software architects and senior engineers who practice or are interested in DDD. They read the blog, they're curious about SDD, they want to evaluate whether this is real before investing time. They will scrutinize depth, accuracy, and craft quality.

**Secondary**: DDD community leaders (Evans, Vernon, Brandolini, Khononov, conference organizers). These people will see this if SDD gains traction. The site must demonstrate intellectual rigor and respectful lineage acknowledgment.

**Tertiary**: Technical founders and solo builders who know their architecture should be better but don't have DDD vocabulary yet. The site should be approachable without dumbing down.

---

## 3. Technical Requirements

### 3.1 Performance

**Target: Sub-second First Contentful Paint (FCP) on 4G connections.**

- Static site generation (SSG). No server-side rendering, no hydration waterfalls.
- Framework: Astro (static output, zero JS by default, island architecture for interactive sections).
- **All above-the-fold CSS inlined in `<head>`.** This is not limited to layout skeleton — it includes every style needed to render the hero section pixel-complete: custom properties, typography, colors, backgrounds, convergence visualization, stats bar, nav, badges, buttons, glows. The user sees a fully styled above-the-fold experience with zero external CSS requests. No partial rendering. No style pop-in.
- **Everything below the fold is lazy-loaded.** CSS for the walkthrough, gap categories, lineage timeline, get-started section, and all interactive component styles load via `<link rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'">` with `<noscript><link rel="stylesheet" href="..."></noscript>` fallback. These stylesheets are split per-section so each loads only when needed.
- **No external stylesheet in the critical path.** Zero render-blocking `<link rel="stylesheet">` tags in `<head>`. The inlined CSS is the only CSS that exists before first paint. Deferred CSS arrives after the browser has already painted the hero.
- **Build-time extraction**: Astro build pipeline extracts above-the-fold CSS automatically. The boundary is defined by the hero section's component tree — any CSS referenced by the hero, nav, or convergence visualization is inlined. Everything else is extracted into per-section deferred bundles.

#### Font Loading

**Fonts are lazy-loaded with explicit FOUT (Flash of Unstyled Text) strategy.** System fonts render immediately. Web fonts swap in when available. No invisible text. No layout shift.

- `font-display: swap` on all `@font-face` declarations.
- Fonts are self-hosted, subset to Latin + Latin Extended characters. No Google Fonts CDN round-trip.
- Font files are **not** preloaded. They load via normal CSS cascade after the deferred stylesheet applies. The system font stack renders the page instantly; Outfit and JetBrains Mono swap in when their files arrive.
- System font fallback stack tuned to minimize layout shift on swap: `'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` for body. `'JetBrains Mono', 'SF Mono', 'Cascadia Code', 'Consolas', monospace` for code.
- `size-adjust`, `ascent-override`, and `descent-override` on `@font-face` to match system fallback metrics and minimize CLS on swap.
- Outfit loaded at 300, 400, 500, 600, 700 as separate files (not a variable font — allows per-weight loading). Only 400 and 600 are in the critical path; other weights load on demand.
- JetBrains Mono loaded at 400 and 500 only.

#### Image Optimization

**Every image is DPI-aware, format-optimized, and progressively loaded.**

**`<picture>` elements are mandatory for all images.** No bare `<img>` tags anywhere in the site. Every image uses `<picture>` with:

1. **Format negotiation**: WebP source with AVIF where supported, fallback to optimized PNG/JPEG.
2. **DPI-specific `srcset`**: Every image provides 1x, 2x, and 3x variants. The browser selects based on `window.devicePixelRatio`. Sizes attribute matches the image's rendered width at each breakpoint.
3. **Progressive loading with LQIP (Low-Quality Image Placeholder)**:
   - The `<img>` fallback inside `<picture>` loads a **very low-quality placeholder image file** (32px wide, JPEG quality 20, typically 200-500 bytes). This is a real image request, not base64 — base64 inlining bloats the HTML document and penalizes parse time for every visitor whether they see the image or not.
   - LQIP image files are served from the same edge CDN with `immutable` caching. After the first visit, they're browser-cached permanently.
   - The LQIP renders with `filter: blur(10px)` and CSS `background-size: cover` to fill the space as a blurred preview.
   - The `<picture>` `<source>` elements specify the full-quality, DPI-correct image. The browser begins loading the correct variant immediately.
   - When the full-quality image loads, it replaces the placeholder. The transition uses `opacity` fade (200ms) to avoid a hard swap. The blur filter is removed.
   - For above-the-fold images: LQIP file is preloaded via `<link rel="preload" as="image" href="img/hero-lqip.jpg">` in `<head>`. Full-quality image uses `fetchpriority="high"`. Two requests, both tiny, both fast.
   - For below-the-fold images: `loading="lazy"` with `decoding="async"` on both LQIP and full-quality sources. Browser only fetches when the image enters the viewport.

**Implementation pattern:**

```html
<!-- Preload above-the-fold LQIP in <head> -->
<link rel="preload" as="image" href="img/hero-lqip.jpg">

<!-- Image element -->
<picture class="progressive-img">
  <!-- Full quality: AVIF, DPI-aware -->
  <source
    type="image/avif"
    srcset="img/hero-400w.avif 400w, img/hero-800w.avif 800w, img/hero-1200w.avif 1200w"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
  <!-- Full quality: WebP, DPI-aware -->
  <source
    type="image/webp"
    srcset="img/hero-400w.webp 400w, img/hero-800w.webp 800w, img/hero-1200w.webp 1200w"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
  <!-- LQIP as initial src, full-quality as data-src -->
  <img
    src="img/hero-lqip.jpg"
    data-src="img/hero-800w.jpg"
    alt="Descriptive alt text"
    width="800"
    height="450"
    loading="lazy"
    decoding="async"
    style="filter:blur(10px);transition:filter 0.2s,opacity 0.2s"
    onload="if(this.src!==this.dataset.src){this.src=this.dataset.src}else{this.style.filter='none'}"
  />
</picture>
```

**Image build pipeline** (Astro integration):

- Source images stored as high-resolution originals (2x or 3x).
- Astro `@astrojs/image` or `sharp` generates all variants at build time: 1x, 2x, 3x in AVIF, WebP, and JPEG/PNG.
- LQIP files generated at build time: 32px wide, JPEG quality 20, saved as separate image files (not base64). Typically 200-500 bytes each.
- LQIP files are content-hashed and cached `immutable` alongside all other image assets.
- No runtime image processing. All variants are static files on CDN.
- No base64 encoding anywhere. Every image — including placeholders — is a real file served over HTTP and eligible for browser and edge caching.

**Explicit width and height on every `<img>`** to reserve layout space and prevent CLS. Aspect ratio maintained via CSS `aspect-ratio` property as backup.

- JavaScript: Deferred. Interactive sections load as Astro islands — JS ships only for components that need it. The hero convergence animation, gap walkthrough, and lineage timeline are the only JS-required sections.
- Bundle budget: < 30KB critical path (fully styled above-the-fold HTML + inlined CSS — no base64, no embedded images). < 150KB total including all deferred section CSS, interactive JS, and font files. Font files, LQIP image files, and below-the-fold CSS are excluded from the critical budget — they arrive after first paint as cacheable edge requests.
- Lighthouse targets: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- Core Web Vitals: LCP < 1.2s, FID < 50ms, CLS < 0.05. CLS target accounts for FOUT swap — `size-adjust` and metric overrides keep shift below threshold.

### 3.2 SEO

**The site must be the definitive search result for SDD-related queries.**

- Semantic HTML: proper heading hierarchy (single `<h1>` per page), `<article>`, `<section>`, `<nav>`, `<main>`.
- Structured data (JSON-LD): `Article` schema for the methodology overview, `HowTo` schema for the quick-start guide, `BreadcrumbList` for navigation, `Organization` for authorship.
- Meta tags: unique `<title>` and `<meta name="description">` per page. Open Graph and Twitter Card tags for social sharing.
- Canonical URLs on every page.
- Sitemap.xml auto-generated. robots.txt permissive.
- Internal linking strategy: every section cross-links to related sections. Blog series links back to site. Site links to blog posts. Repo README links to site.
- Page speed as ranking signal: sub-second FCP directly supports SEO.
- Alt text on every visual element. SVG `<title>` and `<desc>` elements on interactive visualizations.
- URL structure: clean, descriptive slugs (`/walkthrough`, `/gap-categories`, `/lineage`). No hash fragments for primary content.

**Target keywords** (prioritized):

| Priority | Keyword | Target Page |
|----------|---------|-------------|
| P0 | signal driven development | Homepage |
| P0 | DDD definition of done | Homepage |
| P0 | domain driven design gap report | /walkthrough |
| P1 | DDD gap analysis | /gap-categories |
| P1 | domain model verification | Homepage |
| P1 | DDD solo practitioner | Homepage |
| P2 | DDD heuristic thresholds | /gap-categories |
| P2 | aggregate invariant check | /gap-categories |
| P2 | three pass convergence | /walkthrough |
| P2 | DDD architecture palette | /methodology |

### 3.3 Theming

**Dark + light theme. No manual switcher. System preference detection with dark default.**

- CSS `prefers-color-scheme` media query as the detection mechanism.
- If the browser reports `prefers-color-scheme: dark` → dark theme.
- If the browser reports `prefers-color-scheme: light` → light theme.
- If the browser does not support the query or reports no preference → dark theme (default).
- All colors defined as CSS custom properties on `:root` and overridden in `@media (prefers-color-scheme: light)`.
- No `localStorage`-based theme persistence. No toggle button. The site respects the user's system choice, period.
- Both themes must be fully designed — not an afterthought inversion. Light theme is not "swap black and white." It's a deliberate palette.

**Dark palette** (primary):

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0D0F12` | Page background |
| `--bg-surface` | `#141720` | Card/panel backgrounds |
| `--bg-surface-2` | `#1A1F2A` | Elevated surfaces, active states |
| `--border` | `#1E2530` | Default borders |
| `--border-hover` | `#2A3A50` | Hover state borders |
| `--text-primary` | `#F0F2F5` | Headings, primary content |
| `--text-secondary` | `#8896A8` | Body text |
| `--text-tertiary` | `#4A5568` | Labels, hints, muted content |
| `--accent` | `#3B82F6` | Primary accent (links, badges, active states) |
| `--gap-error` | `#EF4444` | Structural gap severity, error states |
| `--gap-warning` | `#EAB308` | Heuristic gap severity, warning states |
| `--gap-success` | `#22C55E` | Converged state, resolved gaps |
| `--gap-language` | `#8B5CF6` | Language gap category |

**Light palette** (warm paper tones):

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#FAF8F5` | Page background — warm off-white |
| `--bg-surface` | `#FFFFFF` | Card/panel backgrounds |
| `--bg-surface-2` | `#F2EFEB` | Elevated surfaces, active states |
| `--border` | `#E5E0DA` | Default borders |
| `--border-hover` | `#D0C9C0` | Hover state borders |
| `--text-primary` | `#1A1D21` | Headings, primary content |
| `--text-secondary` | `#4A4540` | Body text |
| `--text-tertiary` | `#8A8480` | Labels, hints, muted content |
| `--accent` | `#2563EB` | Primary accent (slightly deeper blue for contrast on warm bg) |
| `--gap-error` | `#DC2626` | Structural gap severity |
| `--gap-warning` | `#CA8A04` | Heuristic gap severity |
| `--gap-success` | `#16A34A` | Converged state |
| `--gap-language` | `#7C3AED` | Language gap category |

Both palettes are fully designed. Dark is the flagship experience. Light adapts the same spatial and typographic design to warm paper tones — not a mechanical inversion.

### 3.4 CI/CD Pipeline

**GitHub Actions is the CI platform. Every push and PR is gated by lint, test, and build.**

No code merges to `main` without a passing pipeline. The pipeline is fast, strict, and blocks on failure at every stage.

#### Workflow: `ci-site.yml` — runs on every push and pull request modifying `site/`

**Trigger**: `push` to any branch modifying `site/**` or `.github/workflows/ci-site.yml`, `pull_request` to `main` with the same path filters.

**Stages** (sequential — each stage gates the next):

| Stage | Tool | What it checks | Fail behavior |
|-------|------|----------------|---------------|
| **Lint: Markup** | `markdownlint-cli2` | All `.md` content files (templates, examples, docs) | Block merge |
| **Lint: Styles** | `stylelint` | All CSS — enforces design system tokens, no hardcoded colors, no banned properties (gradients, shadows outside exceptions) | Block merge |
| **Lint: Scripts** | `eslint` + `typescript-eslint` | All TS/JS — strict mode, no `any`, no unused vars, no console.log in production code | Block merge |
| **Lint: HTML** | `astro check` | Astro component validation — type checking, missing props, invalid slot usage | Block merge |
| **Lint: Accessibility** | `eslint-plugin-jsx-a11y` | Accessibility rules — alt text, aria attributes, keyboard handlers, color contrast annotations | Block merge |
| **Format check** | `prettier --check` | Consistent formatting across all source files. Not auto-fixed in CI — developer must fix locally. | Block merge |
| **Unit tests** | `vitest` | Component logic — walkthrough state machine transitions, gap resolution counter, pass progression, threshold slider calculations | Block merge |
| **Integration tests** | `vitest` + `happy-dom` | Component rendering — all interactive sections render without errors, click handlers fire, state updates propagate correctly | Block merge |
| **Accessibility audit** | `axe-core` via `vitest-axe` | Runtime a11y validation — every page and interactive state tested for WCAG 2.1 AA violations | Block merge |
| **Build** | `astro build` | Full production build — static output, asset hashing, image pipeline (sharp generates all AVIF/WebP/JPEG variants + LQIP files), CSS extraction (inlined above-the-fold, deferred below-the-fold) | Block merge |
| **Bundle analysis** | Custom script | Critical path budget: < 30KB. Total budget: < 150KB. Fails if any budget is exceeded. Reports delta from previous build. | Block merge |
| **Lighthouse CI** | `@lhci/cli` | Runs Lighthouse against the built static output. Asserts: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95. Fails if any score drops below threshold. | Block merge |

**Environment**: `ubuntu-latest`, Node 20 LTS. Dependencies cached via `actions/cache` on `site/node_modules` (keyed on `site/package-lock.json`) and `site/.cache/sharp` (image processing cache — avoids regenerating all image variants on every run).

**Parallelization**: Lint stages run in parallel (markup, styles, scripts, HTML, a11y, format). Tests run after all lints pass. Build runs after tests pass. Bundle analysis and Lighthouse run after build.

**Workflow definition:**

```yaml
name: CI — Website

on:
  push:
    branches: ['**']
    paths:
      - 'site/**'
      - '.github/workflows/ci-site.yml'
  pull_request:
    branches: [main]
    paths:
      - 'site/**'
      - '.github/workflows/ci-site.yml'

concurrency:
  group: ci-site-${{ github.ref }}
  cancel-in-progress: true

defaults:
  run:
    working-directory: site

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: site/package-lock.json
      - run: npm ci
      - run: npm run lint:md
      - run: npm run lint:css
      - run: npm run lint:js
      - run: npm run lint:astro
      - run: npm run lint:a11y
      - run: npm run format:check

  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: site/package-lock.json
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:a11y

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: site/package-lock.json
      - uses: actions/cache@v4
        with:
          path: site/.cache/sharp
          key: sharp-${{ runner.os }}-${{ hashFiles('site/src/assets/**') }}
      - run: npm ci
      - run: npm run build
      - run: npm run check:bundle-budget
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: site/dist/

  lighthouse:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: site/dist/
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: site/package-lock.json
      - run: npm ci
      - run: npx serve dist -l 3000 &
      - run: |
          npx @lhci/cli autorun \
            --collect.url=http://localhost:3000 \
            --collect.url=http://localhost:3000/walkthrough \
            --collect.url=http://localhost:3000/gap-categories \
            --collect.url=http://localhost:3000/lineage \
            --assert.preset=lighthouse:recommended \
            --assert.assertions.categories:performance=error \
            --assert.assertions.categories:accessibility=error \
            --assert.assertions.categories:best-practices=error \
            --assert.assertions.categories:seo=error
```

#### Workflow: `deploy-site.yml` — runs on push to `main` modifying `site/` only

**Trigger**: `push` to `main` with paths matching `site/**`.

**Stages**:

| Stage | What it does |
|-------|-------------|
| **Build** | Full production build (same as CI, `working-directory: site`) |
| **Deploy** | Push `site/dist/` to Vercel via `vercel --prod`. Uses `VERCEL_TOKEN` and `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` from repository secrets. |

Vercel Git integration is **disabled** — deploys are controlled exclusively through the GitHub Actions workflow to ensure only CI-passing code reaches production. No automatic deploys on push. A README typo fix at the root does not trigger a deploy.

#### Branch protection rules on `main`

- Require CI workflow to pass before merge
- No direct pushes to `main`
- Require linear history (squash merge only)

#### npm scripts (in `site/package.json`, referenced in workflows)

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "lint:md": "markdownlint-cli2 'content/**/*.md' 'docs/**/*.md'",
    "lint:css": "stylelint 'src/**/*.{css,astro}'",
    "lint:js": "eslint 'src/**/*.{ts,tsx,astro}'",
    "lint:astro": "astro check",
    "lint:a11y": "eslint --rule '{jsx-a11y/alt-text: error, jsx-a11y/aria-props: error}' 'src/**/*.{tsx,astro}'",
    "format:check": "prettier --check 'src/**/*.{ts,tsx,css,astro,md}'",
    "format:fix": "prettier --write 'src/**/*.{ts,tsx,css,astro,md}'",
    "test:unit": "vitest run --project unit --reporter=verbose",
    "test:integration": "vitest run --project integration",
    "test:a11y": "vitest run --project a11y",
    "check:bundle-budget": "node scripts/check-bundle-budget.mjs",
    "sync:content-hashes": "node scripts/sync-content-hashes.mjs"
  }
}
```

#### Bundle budget check script

`site/scripts/check-bundle-budget.mjs` reads the built `site/dist/` output and asserts:

- Critical path (inlined HTML for `/index.html`): < 30KB gzipped
- Total JS (all deferred bundles): < 100KB gzipped
- Total CSS (all deferred bundles): < 20KB gzipped
- Total site (all assets excluding images and fonts): < 150KB gzipped

**Per-bundle limit**: Not set until the walkthrough is built. After the first working build, measure the walkthrough bundle size, then set the per-bundle ceiling at actual size + 20% headroom. A budget set before code exists is a guess. The aggregate budgets above are the hard gates for launch; per-bundle limits are added post-build as regression guards.

Reports sizes, deltas from threshold, and exits non-zero if any budget is exceeded.

### 3.5 Hosting, Edge Deployment & Caching

**Vercel is the deployment platform. Vercel Edge Network handles global CDN distribution.**

**Deployment**:

- Static site deployed to Vercel. Deploys controlled exclusively through the `deploy-site.yml` GitHub Actions workflow (§3.4). Vercel Git integration is disabled.
- Vercel Edge Network distributes to 30+ global PoPs. First-byte latency target: < 50ms for US/EU, < 150ms globally.
- Domain: TBD. Vercel preview URLs available immediately. Custom domain configured post-launch.
- Repo is open source.
- No server infrastructure. No API calls. No database. No serverless functions. Pure static.

**Caching strategy — aggressive, immutable where possible:**

All caching is configured via `vercel.json` headers. The strategy exploits the fact that this is a fully static site with content-hashed assets — nothing changes between deploys, and deploys produce new filenames for changed assets.

| Asset Type | Cache-Control | Rationale |
|------------|--------------|-----------|
| HTML pages (`/`, `/walkthrough`, etc.) | `public, max-age=0, s-maxage=86400, stale-while-revalidate=604800` | Edge caches for 24h. Browser always revalidates (gets 304 if unchanged). `stale-while-revalidate` serves stale for up to 7 days while fetching fresh in background — zero downtime on deploy. |
| Hashed static assets (JS, CSS bundles) | `public, max-age=31536000, immutable` | 1 year. Filename includes content hash (e.g., `walkthrough.a3f8b2.js`). Content never changes for a given filename. Browser and edge cache indefinitely. New deploys produce new filenames — old caches expire naturally. |
| Font files (`.woff2`) | `public, max-age=31536000, immutable` | 1 year. Fonts are versioned by filename. Never change. Cache forever. |
| Images — full quality (AVIF, WebP, JPEG/PNG) | `public, max-age=31536000, immutable` | 1 year. All image variants are content-hashed at build time. Immutable. |
| Images — LQIP placeholders (`.jpg`, 200-500 bytes) | `public, max-age=31536000, immutable` | 1 year. Content-hashed like all other images. Cached at edge and browser after first request. Tiny file size means negligible transfer cost even on cache miss. |
| `sitemap.xml`, `robots.txt` | `public, max-age=3600, s-maxage=86400` | Edge caches 24h. Browser refreshes hourly. Low-traffic files, conservative caching. |
| Structured data (JSON-LD) | N/A — inlined in HTML | No separate request. |

**`vercel.json` headers configuration:**

```json
{
  "headers": [
    {
      "source": "/(.*).html",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800" }
      ]
    },
    {
      "source": "/_astro/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/fonts/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/img/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**Edge behavior**:

- Vercel Edge Network caches all static assets at every PoP. First request to a PoP populates the edge cache. Subsequent requests from the same region are served from edge — zero origin round-trips.
- `stale-while-revalidate` on HTML ensures that deploys propagate without users ever seeing a loading state. The edge serves the previous version while fetching the new one in the background. The next request gets the fresh version.
- Immutable assets (JS, CSS, fonts, images) never revalidate. The content hash in the filename is the cache-busting mechanism. Old filenames age out of edge caches naturally after TTL expiry (irrelevant since they're never requested again after a deploy).

**Preconnect / DNS prefetch**: None required. All assets are first-party, served from the same Vercel edge domain. No third-party origins in the critical path (no Google Fonts, no external CDN, no analytics on first load).

**Cache invalidation on deploy**: Vercel automatically purges edge caches for HTML routes on deploy. Hashed assets don't need purging — new filenames are new cache entries. Net result: deploy → HTML revalidates within `stale-while-revalidate` window → new HTML references new hashed assets → users get the update on next visit with zero cache-busting complexity.

---

## 4. Information Architecture

### 4.1 Site Map

```text
/                           → Homepage (hero + methodology overview)
/walkthrough                → Interactive three-pass convergence experience
/gap-categories             → Gap category reference with examples
/lineage                    → Interactive DDD lineage timeline
/get-started                → Quick start guide + repo links
```

Single-page scroll on the homepage with anchor links to each section. Deep-link pages for SEO juice on high-value queries. The homepage is the full experience for first-time visitors; individual pages serve returning visitors and search traffic.

### 4.2 Navigation

Minimal top nav: `SDD` wordmark (left) → section links (center) → `GitHub` repo link (right). Sticky on scroll. Collapses to hamburger on mobile. No dropdowns.

---

## 5. Repository Structure & Coexistence

**The website lives in the existing `listenrightmeow/signal-driven-development` repository.** The methodology content (templates, examples, docs, scripts) remains at the root. The Astro website lives in a `site/` directory. Both coexist without interference.

### 5.1 Existing Repository Structure (untouched)

```text
signal-driven-development/
├── .github/                        # Existing GH config
├── docs/                           # Methodology documentation
│   ├── quickstart.md
│   ├── gap-categories.md
│   ├── convergence-flow.md
│   └── faq.md
├── examples/                       # Worked examples
│   └── veterinary-clinic/
│       ├── pass-1/
│       ├── pass-2/
│       └── pass-3/
├── scripts/                        # Methodology tooling
│   ├── init-domain.sh
│   └── check-content-drift.sh      # Content drift detection (used by ci-content.yml)
├── templates/                      # SDD templates
│   ├── domain-specification.md
│   ├── gap-report.md
│   ├── gap-resolution-log.md
│   └── architecture-palette.md
├── .markdownlint-cli2.yaml
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

**This structure does not change.** No files are moved, renamed, or reorganized. The methodology content is consumed by practitioners who clone the repo — that workflow must remain zero-friction.

### 5.2 Website Addition

```text
signal-driven-development/
├── site/                           # ← Astro website (new)
│   ├── src/
│   │   ├── assets/                 # Source images (high-res originals)
│   │   ├── components/             # Astro/React components
│   │   │   ├── Hero.astro
│   │   │   ├── ConvergenceViz.astro
│   │   │   ├── Walkthrough.tsx     # Island — interactive React
│   │   │   ├── GapCategories.astro
│   │   │   ├── ThresholdSlider.tsx  # Island — interactive React
│   │   │   ├── LineageTimeline.tsx  # Island — interactive React
│   │   │   ├── GetStarted.astro
│   │   │   ├── Nav.astro
│   │   │   └── ProgressiveImage.astro
│   │   ├── data/                   # Static JSON data for walkthrough
│   │   │   ├── walkthrough.json    # All 23 gaps, resolutions, pass states
│   │   │   ├── lineage.json        # Timeline entries with links
│   │   │   ├── thresholds.json     # HG defaults and threshold metadata
│   │   │   └── .content-hashes.json # Drift manifest — methodology source hashes
│   │   ├── layouts/
│   │   │   └── Base.astro          # HTML shell, inlined CSS, meta tags
│   │   ├── pages/
│   │   │   ├── index.astro         # Homepage
│   │   │   ├── walkthrough.astro
│   │   │   ├── gap-categories.astro
│   │   │   ├── lineage.astro
│   │   │   ├── get-started.astro
│   │   │   └── 404.astro           # Styled 404 — "This gap isn't in the report."
│   │   └── styles/
│   │       ├── critical.css        # Inlined above-the-fold (built into <head>)
│   │       ├── tokens.css          # CSS custom properties — both themes
│   │       ├── walkthrough.css     # Deferred — lazy loaded
│   │       ├── categories.css      # Deferred — lazy loaded
│   │       ├── lineage.css         # Deferred — lazy loaded
│   │       └── get-started.css     # Deferred — lazy loaded
│   ├── public/
│   │   ├── fonts/                  # Self-hosted, subset woff2 files
│   │   ├── img/                    # Build output: all image variants + LQIPs
│   │   │   └── og/                 # Per-page OG images (1200×630, generated at build)
│   │   │       ├── home.png
│   │   │       ├── walkthrough.png
│   │   │       ├── gap-categories.png
│   │   │       ├── lineage.png
│   │   │       └── get-started.png
│   │   ├── favicon.svg             # SVG favicon — convergence motif
│   │   ├── favicon.ico             # PNG fallback for legacy browsers
│   │   ├── apple-touch-icon.png    # 180×180 PNG
│   │   ├── icon-192.png            # Web manifest icon
│   │   ├── icon-512.png            # Web manifest icon
│   │   ├── site.webmanifest        # PWA manifest
│   │   ├── robots.txt
│   │   └── sitemap.xml             # Auto-generated by @astrojs/sitemap
│   ├── scripts/
│   │   ├── check-bundle-budget.mjs
│   │   ├── sync-content-hashes.mjs  # Regenerates .content-hashes.json from source files
│   │   └── prebuild-walkthrough-data.mjs # Parses vet clinic markdown → walkthrough.json
│   ├── tests/
│   │   ├── unit/                   # Vitest unit tests
│   │   ├── integration/            # Vitest + happy-dom
│   │   └── a11y/                   # Vitest + axe-core
│   ├── astro.config.mjs
│   ├── tsconfig.json
│   ├── package.json                # Website dependencies only
│   ├── package-lock.json
│   ├── vitest.config.ts            # Single config with projects: unit, integration, a11y
│   ├── .eslintrc.cjs
│   ├── .stylelintrc.json
│   ├── .prettierrc
│   └── vercel.json                 # Caching headers, build config
├── .github/
│   └── workflows/
│       ├── ci-site.yml             # Website CI (lint, test, build, audit)
│       ├── deploy-site.yml         # Website deploy to Vercel
│       └── ci-content.yml          # Methodology content CI (existing)
└── ... (existing root files unchanged)
```

### 5.3 Segregation Principles

**Hard boundary at `site/`.** The website has its own `package.json`, its own `node_modules`, its own TypeScript config, its own linter configs. No root-level `package.json` is added. No root-level `node_modules`. Practitioners who clone the repo to use the templates never encounter Node.js dependencies.

**Website reads from methodology content at build time.** The Astro build pipeline can import markdown files from `../templates/`, `../examples/`, and `../docs/` as data sources. This means the worked example in the walkthrough is always in sync with the repo content — one source of truth. The website doesn't duplicate content; it renders it.

**Target architecture**: A prebuild script (`site/scripts/prebuild-walkthrough-data.mjs`) parses the vet clinic markdown files and emits `walkthrough.json` automatically. This eliminates manual sync between methodology content and website data. The prebuild runs as part of `npm run build` via a `prebuild` hook:

```json
{
  "scripts": {
    "prebuild": "node scripts/prebuild-walkthrough-data.mjs",
    "build": "astro build"
  }
}
```

The prebuild script reads from `../examples/veterinary-clinic/`, extracts gap IDs, severities, descriptions, analyses, recommendations, and resolutions from each pass's markdown, and writes structured JSON to `src/data/walkthrough.json`. The drift detection manifest (`.content-hashes.json`) is updated automatically by the prebuild — not manually.

Until the prebuild parser is implemented, `walkthrough.json` is manually maintained. The drift detection check in `ci-content.yml` catches staleness in the interim. The prebuild script replaces manual sync as soon as it ships.

**No website artifacts at the root.** No `dist/`, no `node_modules/`, no `.vercel/`, no build cache at the root level. Everything website-related lives inside `site/` or `.github/workflows/`. The root `.gitignore` adds:

```text
site/node_modules/
site/dist/
site/.astro/
site/.vercel/
```

**Vercel build is scoped to `site/`.** The `vercel.json` or Vercel project settings set:

- Root directory: `site`
- Build command: `npm run build`
- Output directory: `dist`

Vercel only sees and builds the `site/` directory. The methodology content at root is invisible to the deployment.

### 5.4 CI Scoping

**Three separate workflows, each scoped to its own file paths.** Changes to methodology content don't trigger website CI. Changes to website code don't trigger content linting. Changes to workflows themselves trigger their respective pipeline.

#### `ci-content.yml` — Methodology content

**Trigger**: Push/PR modifying files matching:

```yaml
paths:
  - 'templates/**'
  - 'examples/**'
  - 'docs/**'
  - 'scripts/**'
  - '*.md'
  - '.markdownlint-cli2.yaml'
```

**Scope**: Runs markdownlint checks against methodology content. No Node.js install beyond markdownlint-cli2. Fast — under 30 seconds.

**Content drift detection**: After linting passes, a lightweight check compares methodology source files against the website's static data files to detect staleness. This does **not** trigger a deploy — it warns the author that the site may need updating.

The check runs a script (`scripts/check-content-drift.sh`) that computes hashes of methodology source files the website depends on and compares them against a manifest file (`site/src/data/.content-hashes.json`) that records which methodology file versions were used when the website data was last updated.

```yaml
  drift-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check for content drift
        run: |
          ./scripts/check-content-drift.sh
```

**Drift manifest** (`site/src/data/.content-hashes.json`):

```json
{
  "sources": {
    "examples/veterinary-clinic/pass-1/gap-report.md": "a3f8b2c...",
    "examples/veterinary-clinic/pass-1/gap-resolution-log.md": "9e1d4f7...",
    "examples/veterinary-clinic/pass-2/gap-report.md": "c82ab01...",
    "examples/veterinary-clinic/pass-2/gap-resolution-log.md": "4f3e9a2...",
    "examples/veterinary-clinic/pass-3/gap-report.md": "7d2c1b8...",
    "docs/gap-categories.md": "e5a93f1..."
  },
  "lastSynced": "2026-03-22T00:00:00Z"
}
```

**`scripts/check-content-drift.sh`** behavior:

- Computes SHA256 of each source file listed in the manifest
- Compares against the stored hash
- If any hash differs: **fails the CI check** with a clear message:

```text
CONTENT DRIFT DETECTED

  Modified: examples/veterinary-clinic/pass-1/gap-report.md
    Manifest: a3f8b2c...
    Current:  f91e3d0...

The website's walkthrough data may be stale. Update site/src/data/walkthrough.json
and run: npm run sync:content-hashes (from site/) to update the manifest.
```

- If all hashes match: passes silently.

**The workflow for updating methodology content that the site depends on:**

1. Edit the methodology files (e.g., update a gap in the worked example)
2. Update `site/src/data/walkthrough.json` to reflect the change
3. Run `npm run sync:content-hashes` from `site/` — regenerates `.content-hashes.json` from current source file hashes
4. Commit all three changes together. `ci-content.yml` passes (hashes match). `ci-site.yml` fires (site files changed). `deploy-site.yml` deploys the updated site.

**If you deliberately update methodology content without updating the site** (e.g., adding a new worked example that the site doesn't render yet), add the new file to the manifest with its current hash. The drift check only fails when a *tracked* file changes — untracked files are ignored.

This ensures: documentation-only changes never trigger a deploy, but documentation changes that invalidate the website's data are caught before merge.

#### `ci-site.yml` — Website

**Trigger**: Push/PR modifying files matching:

```yaml
paths:
  - 'site/**'
  - '.github/workflows/ci-site.yml'
  - '.github/workflows/deploy-site.yml'
```

**Scope**: All lint, test, build, bundle analysis, and Lighthouse stages from §3.4. Working directory is `site/` for every step:

```yaml
defaults:
  run:
    working-directory: site
```

Dependencies cached under `site/node_modules` and `site/.astro`. Sharp cache keyed on `site/src/assets/**`.

#### `deploy-site.yml` — Website deployment

**Trigger**: Push to `main` modifying files matching:

```yaml
paths:
  - 'site/**'
```

**Scope**: Build + deploy to Vercel production. Only fires when website code changes. A README typo fix at the root does not trigger a deploy.

### 5.5 Developer Workflow

**For methodology contributors** (templates, examples, docs):

- Clone the repo. Edit markdown. Push. `ci-content.yml` runs markdownlint. No Node.js setup required.

**For website contributors:**

```bash
cd site
npm install
npm run dev          # Astro dev server on localhost:4321
npm run build        # Production build to site/dist/
npm run preview      # Preview production build locally
npm run test:unit    # Run unit tests
npm run lint:css     # Run stylelint
```

The root of the repo is never the working directory for website development. All commands run from `site/`.

---

## 6. Page Specifications

### 6.1 Homepage / Hero

**URL**: `/`
**Purpose**: First impression. Establish what SDD is in under 5 seconds. Drive to the walkthrough.
**SEO target**: "signal driven development," "DDD definition of done"

**Content**:

- Badge: "Signal-Driven Development"
- Headline: "DDD's missing definition of done."
- Subline: "Three-pass convergence. Gap reports as diagnostic signals. Zero unresolved gaps."
- Primary CTA: "Try the interactive walkthrough" → `/walkthrough`
- Secondary CTA: "View the methodology" → scroll to methodology section

**Convergence visualization**: Animated scatter showing three passes. 18 colored dots (Pass 1, scattered) → 5 dots (Pass 2, clustered) → 1 bright dot (Pass 3, converged). Animation triggers on page load, completes in ~3 seconds. Dots use gap severity colors (red for structural errors, amber for heuristic warnings, etc.).

**Stats bar** (below visualization):

| Stat | Value | Label |
|------|-------|-------|
| Domains | 8 | production domains converged |
| Gaps | 23 | gaps resolved in example |
| Invariants | 5 → 18 | invariants after convergence |

**Interaction**: Hovering a dot in the convergence visualization shows a tooltip with the gap ID and short description. Clicking a dot scrolls to the walkthrough with that gap pre-selected.

**Performance**: The hero renders pixel-complete with zero external requests. All CSS for the hero, nav, convergence visualization, stats bar, badges, and buttons is inlined in `<head>`. The convergence animation uses CSS `@keyframes` with `animation-delay` staggering. Dot positions are computed at build time and embedded as inline styles. System fonts render text immediately; web fonts swap in later via FOUT. The user sees a fully styled, interactive above-the-fold experience before any deferred CSS, JS, or font files arrive.

### 6.2 Interactive Walkthrough

**URL**: `/walkthrough`
**Purpose**: Let a visitor experience a gap report without committing to the methodology. This is the conversion section.
**SEO target**: "DDD gap report," "three pass convergence," "domain model verification"

**Layout**: Two-panel. Left: domain specification tree. Right: gap detail panel. Pass tabs across the top. Progress counter above.

**Specification tree** (left panel):

- Hierarchical view of the vet clinic domain. Bounded contexts → aggregates → commands/events/invariants.
- Each element shows its status: gap badge (red/amber with count), clean badge (green), or neutral.
- Clicking an element selects it and shows its gaps in the right panel.
- Elements with gaps are highlighted with a left border accent in the severity color.
- Expanding/collapsing contexts to show their internals.

**Gap detail** (right panel):

- Gap ID (monospace, severity-colored)
- Severity badge (Error/Warning)
- Gap title (bold, large)
- Rule statement (quoted block with blue left border)
- Analysis (prose explaining what was measured, why it matters, what the consequences are)
- Three action buttons: Resolve (green), Override with rationale (amber), Dismiss (muted)

**Actions**:

- **Resolve**: Clicking "Resolve" shows a brief resolution summary (the actual resolution from the worked example), animates the gap badge disappearing, decrements the counter, and advances the progress bar. The resolution rationale slides in below the gap detail.
- **Override**: Clicking "Override" shows a text input for rationale (pre-filled with the example override rationale). Submitting it resolves the gap as overridden. Distinct visual treatment (amber resolved icon instead of green).
- **Dismiss**: Clicking "Dismiss" marks the gap as dismissed with a muted visual treatment. Counter still decrements.

**Pass progression**:

- Pass 1: 18 gaps. All resolution actions available. Resolving all 18 unlocks Pass 2 tab.
- Pass 2: 5 new gaps surface. Same interaction pattern. Resolving all 5 unlocks Pass 3 tab.
- Pass 3: 0 gaps. Celebratory state: "Converged. Zero unresolved gaps." Final building block summary showing the model's growth (5→18 invariants, 0→1 sagas, etc.). CTA: "Run this on your own domain →" linking to the repo.

**Transition between passes**: When all gaps in a pass are resolved, a brief animation shows the gap count collapsing (e.g., 18 → 0) and the next pass tab pulses. The spec tree updates to reflect Pass 2's modified domain model (new aggregates, renamed elements, added invariants).

**Data source**: All walkthrough content is static, derived from the vet clinic worked example in the repo. No API calls. Data is embedded at build time as JSON.

**Micro-interactions**:

- Counter animates (count down with easing) on each resolution
- Progress bar fills with a gradient (red → amber → green) as gaps resolve
- Resolved gaps in the spec tree get a subtle strikethrough or check animation
- Pass tab badges update in real-time
- Smooth scroll to next unresolved gap after resolving one

**Mobile**: Stacked layout. Spec tree collapses to a horizontal scrollable pill bar of elements with gap badges. Gap detail is full-width below. Pass tabs remain fixed at top.

### 6.3 Gap Categories

**URL**: `/gap-categories`
**Purpose**: Reference page for the four gap types. Each with detailed definition, heuristic thresholds (where applicable), and real examples.
**SEO target**: "DDD gap analysis," "DDD heuristic thresholds," "aggregate invariant check"

**Layout**: Four category cards in a 2×2 grid. Each card has a color-coded top border, category code, name, short description, and one example.

**Interaction**: Clicking a card expands it into a full-page detail view (or scrolls to a detail section below the grid). The detail view shows:

- Category definition (2-3 sentences)
- What it catches (bulleted list of specific checks)
- Heuristic thresholds table (for HG only):

  | Heuristic | Default | Source | What it means |
  |-----------|---------|--------|---------------|
  | Aggregate command density | ≤ 6 | Vernon | Too many commands = too many reasons to change |
  | Context term overlap | ≤ 3 | Evans | Shared terms = insufficient boundary |
  | Saga step count | ≤ 5 | Practical | Beyond 5 = decomposition needed |
  | Invariant coverage | ≥ 1 per aggregate | Evans | No invariants = no consistency boundary |
  | Event fan-out | ≤ 8 per aggregate | Vernon | High fan-out = multiple concerns |

- Real examples from the vet clinic (3-4 per category), each showing the full gap structure: ID, severity, rule, element, analysis, recommendation
- "See this in the walkthrough →" link per example

**Threshold interactivity (HG section)**: A slider or input that lets the user adjust a threshold and see how the gap count changes. Example: slide "aggregate command density" from 6 to 10 — show which gaps in the vet clinic example would no longer trigger. This demonstrates that thresholds are configurable, not dogmatic.

### 6.4 Lineage Timeline

**URL**: `/lineage`
**Purpose**: Credit the DDD community whose work SDD extends. Establish intellectual legitimacy. Make the history of DDD feel alive.
**SEO target**: "DDD history," "domain driven design evolution"

**Format**: Interactive SVG timeline rendered on a canvas-style surface. Horizontal primary axis = time (2003 → 2026). Each authority is a track/lane.

**Timeline entries** (each is an interactive node on the timeline):

| Year | Authority | Contribution | SDD Connection |
|------|-----------|-------------|----------------|
| 2003 | Evans | *Domain-Driven Design* published | SDD inherits the building block vocabulary |
| 2003 | Evans | Bounded contexts, aggregates, ubiquitous language formalized | Gap categories SG and LG derive from these concepts |
| 2006 | Young | CQRS + Event Sourcing patterns | Event-sourced specification model |
| 2013 | Vernon | *Implementing DDD* published | Small aggregate heuristic → HG threshold defaults |
| 2013 | Brandolini | EventStorming formalized | Architecture palette inherits the sticky note vocabulary |
| 2015 | Tune | Bounded Context Canvas | Strategic DDD tooling precedent |
| 2018 | Evans | "DDD isn't done" — Explore DDD keynote | SDD answers: here's what's next |
| 2019 | Baas-Schwegler | *Collaborative Software Design* | Cognitive bias awareness in modeling |
| 2021 | Khononov | *Learning DDD* published | Modern DDD pedagogy |
| 2022 | NDD / Xolvio | Narrative-Driven Development, temporal vocabulary | Moment primitive, temporal scope |
| 2024 | Evans | Explore DDD keynote — LLMs + DDD | Independent convergence with SDD |
| 2024 | Khononov | *Balancing Coupling in Software Design* | Coupling as measurable heuristic → threshold model |
| 2024 | Evans | "AI Components for a Deterministic System" | ACL between deterministic and probabilistic systems |
| 2026 | Evans | "Context Mapping with an AI-based Component" | Same ACL pattern we built independently |
| 2026 | DDD Europe | LLM+Strategic Design workshops | Community mainstreaming AI+DDD |
| 2026 | SDD | Signal-Driven Development published | Three-pass convergence, gap reports, definition of done |

**Interactions**:

- **Hover on a node**: Tooltip with the contribution name, one-line description, and "SDD connection" showing what SDD inherits.
- **Click on a node**: Expands into a detail card below the timeline. Shows the contribution description (2-3 sentences), the specific SDD connection (what was inherited or built upon), and a link to the source (book, article, conference talk, etc.). Card dismisses on click-outside or clicking another node.
- **Scroll/drag**: Timeline is horizontally scrollable/draggable. Current year (2026) is right-aligned on load. The SDD node at the end glows with the accent color.
- **Authority lanes**: Each authority has a subtle colored track. Nodes on the same track are connected by a thin line showing that authority's arc of contributions over time.
- **Convergence visual**: The 2024-2026 section visually shows Evans's track and SDD's track converging — the independent convergence narrative made spatial. The two tracks approach each other and arrive at the same point (AI+DDD integration) from different directions.

**Static fallback**: For users with JS disabled, the timeline renders as a styled HTML table with the same content. Semantic, accessible, indexable.

**Links**: Every source cited in the timeline links to its original publication (book on Amazon/InformIT, article on domainlanguage.com, InfoQ conference coverage, etc.). All links verified.

### 6.5 Get Started

**URL**: `/get-started`
**Purpose**: Convert understanding into action. Three paths based on engagement level.
**SEO target**: "DDD templates," "domain specification template," "gap report template"

**Three paths**:

1. **"I want to try it now"** → `./scripts/init-domain.sh "My Project" 1` terminal block. Scaffolds the full template set for Pass 1. Link to repo scripts directory.

2. **"I want to study first"** → Link to the vet clinic worked example. Brief description of what they'll find: three passes, 23 gaps, full resolution rationale.

3. **"I want to understand the methodology"** → Link to Post 4 (Introducing SDD) and Post 5 (The Gap Report). Brief description of the blog series structure.

**Terminal block**: Styled as a dark terminal with monospace font. The `init-domain.sh` command is copy-on-click. Shows the output:

```bash
$ ./scripts/init-domain.sh "Greenfield Clinic" 1

Created: greenfield-clinic/
  ├── pass-1/
  │   ├── domain-specification.md
  │   ├── gap-report.md
  │   └── gap-resolution-log.md
  └── architecture-palette.md

Ready. Write your domain specification, then run the gap report.
```

**Below the fold**: FAQ section addressing common questions:

- "Is SDD only for DDD?" — Yes, the templates use DDD building blocks.
- "Does it require a team?" — No, designed for solo practitioners.
- "How long does a pass take?" — Pass 1: 2-4 hours. Pass 2: 1-2 hours. Pass 3: 30-60 minutes.
- "Can I use it with AI assistants?" — Yes. The structured templates work well with AI for gap identification. The architect retains decision authority.
- "What if my domain needs more than 3 passes?" — That's fine. The three-pass label is the typical trajectory, not a constraint. The invariant is convergence.

### 6.6 404 Page

**Purpose**: Styled, on-brand error page. First thing a crawler or mistyped URL hits.

**Content**: "Page not found" heading. One-line subtext: "This gap isn't in the report." Primary CTA: "Back to the methodology →" linking to `/`. Secondary: links to `/walkthrough` and the GitHub repo. Uses the same dark/light theming. No generic browser 404.

**SEO**: `<meta name="robots" content="noindex">`. Custom 404 configured in `vercel.json`:

```json
{
  "redirects": [],
  "rewrites": [{ "source": "/((?!_astro|img|fonts).*)", "destination": "/404.html" }]
}
```

### 6.7 Site Identity & Social Assets

**Favicon**: SVG favicon (`<link rel="icon" type="image/svg+xml" href="/favicon.svg">`) with PNG fallback for legacy browsers. The icon is the SDD convergence motif — three dots converging to one. Simple enough to read at 16×16.

**Apple touch icon**: 180×180 PNG. Same motif on the `--bg-primary` background.

**Web manifest** (`site.webmanifest`):

```json
{
  "name": "Signal-Driven Development",
  "short_name": "SDD",
  "start_url": "/",
  "display": "browser",
  "background_color": "#0D0F12",
  "theme_color": "#3B82F6",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Open Graph images**: One unique OG image per page (1200×630px). Each shows the page title, the SDD badge, and a visual element specific to that page:

| Page | OG Image Content |
|------|-----------------|
| `/` | "DDD's missing definition of done." + convergence scatter |
| `/walkthrough` | "Walk through a real convergence" + 18→5→0 trajectory |
| `/gap-categories` | "Four categories of gaps" + SG/HG/LG/DG color chips |
| `/lineage` | "Standing on shoulders" + authority initials (EE, VV, AB, VK, NDD) |
| `/get-started` | "Run your first pass" + terminal motif |

OG images generated at build time via `@vercel/og` or a sharp-based script. All images include `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`. Twitter Card tags mirror OG tags (`twitter:card: summary_large_image`).

---

### 6.8 Cross-Browser & Device Targets

**Supported browsers** (last 2 major versions):

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 120+ | Primary development target |
| Firefox | 121+ | SVG timeline and CSS custom properties |
| Safari | 17+ | `@supports` guards for any Safari-lagging features |
| Edge | 120+ | Chromium-based, matches Chrome |
| Mobile Safari (iOS) | 17+ | Touch interactions on walkthrough and timeline |
| Chrome Mobile (Android) | 120+ | Touch interactions on walkthrough and timeline |

**Not supported**: IE11, Opera Mini, UC Browser. No polyfills for unsupported browsers.

**Testing**: Manual testing on Chrome, Firefox, Safari (macOS + iOS), and Edge before launch. Touch interaction testing on physical iOS and Android devices for the walkthrough and lineage timeline.

---

## 7. Design System

### 7.1 Typography

| Role | Font | Weight | Size | Tracking |
|------|------|--------|------|----------|
| Display heading (h1) | Outfit | 700 | 48-56px | -1.5px |
| Section heading (h2) | Outfit | 600 | 28-32px | -0.8px |
| Subsection heading (h3) | Outfit | 500 | 20px | -0.3px |
| Body text | Outfit | 300-400 | 15-16px | 0 |
| Labels, badges, section tags | Outfit | 500 | 11-12px | 1.5-2px (uppercase) |
| Code, data, counts, monospace | JetBrains Mono | 400-500 | 13-14px | 0 |

Both fonts self-hosted, subset to Latin + Latin Extended, lazy-loaded with FOUT (see §3.1 Font Loading). System fonts render the first paint; web fonts swap in without layout shift. Outfit loaded at 300, 400, 500, 600, 700 as separate per-weight files. JetBrains Mono at 400, 500.

### 7.2 Spacing

8px base unit. Spacing scale: 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 120.

- Section vertical padding: 80-120px
- Card internal padding: 20-24px
- Element gap within cards: 8-12px
- Grid gaps: 12-16px

### 7.3 Components

**Cards**: Background `--bg-surface`, 1px border `--border`, `border-radius: 10px`. Hover: border transitions to `--border-hover`, subtle `translateY(-1px)`.

**Badges**: Pill-shaped, semantic color background at 12-15% opacity, text in full semantic color. 10-11px uppercase.

**Buttons**:

- Primary: `--accent` background, white text, 8px radius, 500 weight.
- Secondary: Transparent background, `--text-tertiary` text, 1px `--border` border.
- Action (resolve/override/dismiss): Semantic color background or border matching the action.

**Code blocks**: `--bg-primary` background, 1px border, `border-radius: 6px`, JetBrains Mono, subtle syntax highlighting (accent for commands, tertiary for comments).

**Tooltips**: `--bg-surface-2` background, 1px border, 8px radius. Appear on hover with 150ms delay. No arrow decoration.

### 7.4 Motion

**Philosophy**: Motion communicates state change and progression. Nothing moves for decoration. Every animation answers "what just happened?"

| Element | Trigger | Animation | Duration |
|---------|---------|-----------|----------|
| Convergence scatter (hero) | Page load / scroll-in | Dots scatter → cluster → converge | 3s total |
| Gap counter | Gap resolved | Count down with easing | 400ms |
| Progress bar | Gap resolved | Width transition with gradient | 600ms |
| Gap badge removal | Gap resolved | Scale to 0 + fade | 300ms |
| Card hover | Mouse enter | Border color + translateY(-1px) | 150ms |
| Pass tab unlock | All gaps resolved | Pulse glow + badge update | 500ms |
| Timeline node hover | Mouse enter | Scale(1.1) + tooltip fade | 200ms |
| Timeline node click | Click | Detail card slide-in from below | 300ms |

All animations respect `prefers-reduced-motion: reduce`. When reduced motion is preferred, state changes happen instantly with no transition.

### 7.5 Responsive Breakpoints

| Breakpoint | Width | Layout changes |
|------------|-------|----------------|
| Desktop | ≥ 1024px | Two-panel walkthrough, 2×2 category grid, full timeline |
| Tablet | 768-1023px | Stacked walkthrough (spec → gap), 2×1 category grid |
| Mobile | < 768px | Single column, horizontal scroll pill bar for spec elements, timeline vertical |

---

## 8. Accessibility

- WCAG 2.1 AA compliance minimum.
- All interactive elements keyboard-navigable. Tab order follows visual order.
- Focus indicators: 2px accent outline on all focusable elements.
- Color contrast: All text meets 4.5:1 ratio against its background in both themes.
- Screen reader: All visualizations have `aria-label` descriptions. Gap walkthrough has `role="application"` with descriptive `aria-live` region for counter updates.
- Alt text on every non-decorative visual. SVG `<title>` and `<desc>` on diagrams.
- Skip navigation link.
- No CAPTCHA, no timed interactions, no auto-playing media.

---

## 9. Analytics

Minimal, privacy-respecting analytics to measure whether the site is converting. **Skipped for MVP.** When added post-launch, the following requirements apply.

**Performance constraint: Analytics must never impact site performance.** All analytics scripts are deferred until after the site is fully rendered and interactive. Analytics is a passive observer — it does not participate in the critical rendering path, the hydration sequence, or any user-facing interaction.

**Loading strategy**:

- Analytics script tag uses `defer` and is placed at the end of `<body>`, after all content and interactive JS.
- Script execution is further gated behind `requestIdleCallback` (with a `setTimeout` fallback at 3000ms for browsers that don't support it). Analytics initialization only fires when the browser's main thread is idle — never during layout, paint, or interaction handler execution.
- No `async` loading — `async` can fire mid-parse and compete with island hydration. `defer` guarantees execution after HTML parsing completes, and `requestIdleCallback` guarantees execution after the browser is idle.
- Analytics must not add any elements to the DOM that trigger reflow or repaint (no injected iframes, no pixel images, no style recalculations).
- If analytics fails to load or initialize, the site functions identically. Zero coupling between analytics and site functionality.
- Analytics is excluded from the critical bundle budget (< 30KB critical path, < 150KB total). The analytics script is a separate, uncounted download that happens after the user is already interacting.

**Verification**: Lighthouse Performance score must be identical with and without analytics enabled. Any analytics implementation that degrades LCP, FID, or CLS is rejected.

- Tool: Plausible Analytics or Fathom (when added). No Google Analytics. No cookies. No consent banner required.
- Events tracked:

  | Event | Trigger | Question it answers |
  |-------|---------|---------------------|
  | `walkthrough_started` | User clicks first gap in walkthrough | Are people engaging with the core experience? |
  | `pass_completed` | All gaps in a pass resolved | How many people complete the full walkthrough? |
  | `walkthrough_completed` | Pass 3 reached | What's the end-to-end completion rate? |
  | `repo_clicked` | Any click to GitHub repo | Is the site converting to repo visits? |
  | `blog_clicked` | Any click to a blog post | Is the site driving blog traffic? |
  | `category_explored` | Gap category card clicked | Which categories are most interesting? |
  | `lineage_node_clicked` | Timeline node clicked | Which authorities/contributions draw attention? |
  | `threshold_adjusted` | HG threshold slider moved | Are people engaging with configurability? |

---

## 10. Content Dependencies

All content is static and must be finalized before build.

| Content | Source | Status |
|---------|--------|--------|
| Vet clinic worked example (3 passes) | SDD repo | ✅ Complete |
| Gap category definitions and thresholds | Sift PRD §5.4 (generalized, no product names) | ✅ Extractable |
| Lineage timeline entries + links | blog-series-schedule-v2.md authority research | ✅ Verified |
| Blog post links (Posts 1-6) | Hashnode | ⬜ Posts 4-6 publish this week |
| Hero stats (8 domains, 23 gaps, etc.) | Real convergence data | ✅ Complete |
| FAQ content | Repo FAQ + blog series | ✅ Extractable |

---

## 11. Launch Plan

### Launch: Full site ships with Post 4 (Target: Tuesday)

Complete interactive experience at launch. No phased rollout — the site is the methodology's first impression and it needs to land fully formed.

**Scope**:

- Homepage (hero + convergence visualization + stats)
- Interactive walkthrough (all three passes, resolve/override/dismiss, counter animations, pass progression)
- Gap categories (cards + detail views with threshold slider for HG)
- Interactive lineage timeline (SVG, hover, click, authority lanes, convergence visual)
- Get started (terminal block + three paths)
- 404 page (styled, on-brand)
- Site identity (favicon, apple-touch-icon, web manifest)
- Per-page OG images (5 pages × 1 unique image)
- Dark theme (primary) + warm light theme (system preference detection, dark default)
- Full SEO: structured data, sitemap, canonical URLs, Open Graph, Twitter Cards
- CI pipeline: `ci-site.yml` + `deploy-site.yml` + `ci-content.yml` with drift detection
- Deployed to Vercel

**Cut-line — if Tuesday gets tight, these are the stretch items (in cut order):**

1. **HG threshold slider in gap categories** — Cut first. The category cards and detail views carry the section without interactivity. The slider is informative, not essential. Add post-launch.
2. **Lineage convergence animation** (Evans track + SDD track converging visually in 2024-2026 zone) — Cut second. The authority lanes, hover, click, and detail cards carry the lineage timeline. The convergence animation is polish. Add post-launch.
3. **Prebuild walkthrough data script** — Cut third. Ship with manually-maintained `walkthrough.json` and rely on drift detection. Automate in week 2.

Everything else ships Tuesday or the launch slips.

**Post-launch iteration (Week 2+)**:

- Custom domain configured
- **301 redirects from Vercel preview URLs to custom domain** — once the custom domain is live, configure redirects so any indexed or shared preview URLs resolve correctly. Vercel supports redirect rules in `vercel.json`. Critical for SEO: any page indexed under the preview domain must redirect to the canonical domain to avoid duplicate content penalties.
- Performance audit and optimization pass
- Mobile polish
- Blog series timeline component (17 posts, published/upcoming states)
- Per-bundle JS budget calibration (measure walkthrough bundle, set ceiling at actual + 20%)
- Prebuild walkthrough data script (if not shipped at launch)
- Threshold slider (if not shipped at launch)
- Community feedback integration

---

## 12. Open Questions

| # | Question | Options | Decision |
|---|----------|---------|----------|
| OQ-1 | Framework choice | Astro (preferred) / Next.js static / 11ty | **Astro** |
| OQ-2 | Hosting | GitHub Pages / Vercel / Cloudflare Pages | **Vercel** — repo will be open source |
| OQ-3 | Domain | TBD — infrastructure decision deferred | **Deferred** |
| OQ-4 | Light theme palette | Warm paper tones / Cool neutral / Match blog | **Warm paper tones** — dark theme is primary, light is warm alternative. Both ship together. System preference detection, dark default. |
| OQ-5 | Analytics tool | Plausible / Fathom / None for MVP | **Skip for MVP** |
| OQ-6 | Phase 1 scope — is lineage static OK for Tuesday? | Yes (iterate later) / No (must be interactive) | **Interactive from day one** — lineage timeline must be the full SVG experience at launch |

---

## 13. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Tuesday deadline aggressive for full interactive site | High | High | Explicit cut-line defined (§11): threshold slider → lineage convergence animation → prebuild script, in that order. Core experience (hero, walkthrough, categories, lineage with interactions, get-started, theming, SEO) ships complete. Stretch items are polish, not functionality. |
| Light theme treated as afterthought, looks bad | Medium | High | Design warm palette upfront as CSS variables before building any components. Validate against hero and walkthrough sections before full rollout. |
| Interactive walkthrough is technically complex (state machine across 3 passes) | Medium | High | Pre-compute all state transitions at build time. Walkthrough is a finite state machine with known states — no dynamic content. All 23 gaps and their resolutions are static data. |
| DDD community scrutinizes lineage and finds a factual error | Low | Very High | Every link verified in blog research session (March 18, 2026). Cross-reference all timeline entries against source URLs before launch. |
| Sub-second FCP target missed due to interactive JS weight | Medium | Medium | Astro island architecture isolates JS to interactive sections. Hero convergence animation is CSS-only. Walkthrough and timeline JS load deferred. Measure after each section. |
