# Website Architecture

The SDD website is a static site that converts blog curiosity into hands-on methodology experience. It is hosted at [signal-driven-development.vercel.app](https://signal-driven-development.vercel.app/).

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Astro 6.x | Static site generation, zero JS by default |
| **Interactive components** | Preact 10.x | Island architecture for interactive sections |
| **Testing** | Vitest 4.x | Unit, integration, and accessibility tests |
| **Styling** | CSS with design tokens | Critical path optimization, dark/light theming |
| **Deployment** | Vercel | Static hosting with edge CDN |
| **Linting** | Prettier, ESLint, Stylelint | Code formatting and quality |
| **Accessibility** | axe-core, jsx-a11y | WCAG 2.1 AA compliance |

## Site Structure

```text
site/
├── src/
│   ├── pages/              # Astro page components
│   │   ├── index.astro     # Homepage
│   │   ├── walkthrough.astro
│   │   ├── gap-categories.astro
│   │   ├── get-started.astro
│   │   └── 404.astro
│   ├── components/         # Interactive Preact + Astro components
│   ├── layouts/
│   │   └── Base.astro      # Base page layout
│   ├── styles/             # CSS (critical + deferred)
│   ├── data/               # JSON data + TypeScript types
│   └── public/             # Static assets (images, fonts)
├── tests/                  # Test suites
├── scripts/                # Build scripts
├── astro.config.mjs
├── vitest.config.ts
└── package.json
```

## Pages

| Path | File | Description |
|------|------|-------------|
| `/` | `index.astro` | Homepage with hero, lineage timeline, methodology overview, gap categories summary, stats bar |
| `/walkthrough` | `walkthrough.astro` | Interactive gap resolution simulation across 3 passes |
| `/gap-categories` | `gap-categories.astro` | Detailed gap category reference with thresholds and sources |
| `/get-started` | `get-started.astro` | Step-by-step getting started guide with links to templates |
| `/404` | `404.astro` | 404 error page |

## Astro Configuration

```javascript
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://signal-driven-development.vercel.app',
  integrations: [preact(), sitemap()],
});
```

Key decisions:

- **Static output** -- no SSR, no serverless functions
- **Preact integration** -- enables island architecture for interactive components
- **Sitemap integration** -- auto-generates `sitemap.xml` for SEO

## Island Architecture

Astro's island architecture means JavaScript only ships for components that need interactivity. The majority of the site is static HTML/CSS with zero JavaScript.

**JS-required islands:**

- `Walkthrough.tsx` -- Interactive gap resolution simulation
- `LineageTimeline.tsx` -- Interactive DDD lineage visualization

**Static components (zero JS):**

- `Hero.astro`, `Nav.astro`, `StatsBar.astro`, `ConvergenceViz.astro`

## Data Flow

```text
JSON data files → Astro pages → Preact islands
                               ↓
                          Static HTML + hydrated islands
```

Data files in `src/data/`:

- `walkthrough.json` -- Veterinary clinic gap data for the interactive walkthrough
- `lineage.json` -- DDD lineage timeline entries with influences
- `thresholds.json` -- Heuristic threshold values
- `.content-hashes.json` -- Content integrity tracking

## Design Principles

1. **Not a product page** -- the site does not mention Complai, Sift, or any commercial product
2. **Experience over documentation** -- the interactive walkthrough is the primary conversion mechanism
3. **Intellectual rigor** -- the DDD community will scrutinize depth, accuracy, and craft quality
4. **Performance** -- sub-second FCP, Lighthouse scores >= 95

See also: [[Website Components]], [[Website Performance]], [[Website Design System]], [[Website SEO]]
