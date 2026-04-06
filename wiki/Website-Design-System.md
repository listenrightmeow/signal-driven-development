# Website Design System

The SDD website uses a CSS custom property-based design system with dark and light themes. Theme selection follows system preference with no manual toggle.

## Theming

- **Detection:** CSS `prefers-color-scheme` media query
- **Dark default:** If no preference detected, dark theme applies
- **No toggle button:** The site respects the user's system choice
- **No localStorage persistence:** Pure CSS-based theming

## Color Tokens

### Dark Palette (Primary)

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

### Gap Severity Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--gap-error` | `#EF4444` | Structural gap severity, error states |
| `--gap-warning` | `#EAB308` | Heuristic gap severity, warning states |
| `--gap-success` | `#22C55E` | Converged state, resolved gaps |
| `--gap-language` | `#8B5CF6` | Language gap category |

### Light Palette

Warm paper tones -- not a simple inversion. Defined as overrides in `@media (prefers-color-scheme: light)`.

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#FAF8F5` | Page background (warm off-white) |
| `--bg-surface` | `#FFFFFF` | Card/panel backgrounds |

## Typography

### Font Families

| Usage | Font | Fallback Stack |
|-------|------|---------------|
| Body | Outfit | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| Code | JetBrains Mono | `'SF Mono', 'Cascadia Code', 'Consolas', monospace` |

### Font Weights

| Weight | Usage |
|--------|-------|
| 300 | Light text (occasional) |
| 400 | Body text, default |
| 500 | Medium emphasis |
| 600 | Headings, labels |
| 700 | Bold emphasis |

## Spacing Scale

Defined as CSS custom properties in `tokens.css`. Consistent spacing throughout the site using a defined scale.

## CSS Architecture

```text
src/styles/
├── tokens.css        # Design system tokens (88 lines)
├── critical.css      # Above-the-fold styles (496 lines)
└── walkthrough.css   # Below-the-fold styles (345 lines)
```

- **tokens.css** -- All custom properties, shared across themes
- **critical.css** -- Inlined in `<head>`, renders everything above the fold
- **walkthrough.css** -- Deferred, loads after first paint

## Accessibility

- **WCAG 2.1 AA compliance** tested with axe-core
- Color contrast ratios meet AA requirements in both themes
- Focus indicators on all interactive elements
- ARIA labels on interactive components
- `alt` text on all images
- `<title>` and `<desc>` on SVG elements
