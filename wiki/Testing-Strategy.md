# Testing Strategy

The SDD website uses Vitest with three test projects: unit, integration, and accessibility. Tests are required to pass in CI before any merge to `main`.

## Test Projects

| Project | Environment | Purpose |
|---------|------------|---------|
| **unit** | Node | Pure logic tests -- state machines, data transformations |
| **integration** | happy-dom | Component rendering, user interaction, DOM assertions |
| **a11y** | happy-dom | WCAG 2.1 AA compliance via axe-core |

Configuration is in `site/vitest.config.ts`.

## Unit Tests

### Walkthrough State Machine (`tests/unit/walkthrough-state.test.ts`)

Tests the pure state machine functions:
- State initialization from walkthrough data
- Gap resolution (marking gaps as resolved)
- Gap selection (selecting a gap for detail view)
- Pass advancement (moving to next pass when all gaps resolved)
- Progress calculation (completion percentage)
- Convergence detection (all passes complete)

### Lineage State (`tests/unit/lineage-state.test.ts`)

Tests timeline filtering and selection logic:
- Node selection and deselection
- Authority filtering
- Connection highlighting

## Integration Tests

### Walkthrough Component (`tests/integration/walkthrough.test.tsx`)

Tests the full Walkthrough Preact component:
- Component renders with correct initial state
- Click handlers fire and update state
- Gap list displays correct items per pass
- Gap detail panel shows correct information
- Resolve action updates progress
- Pass advancement works when all gaps resolved
- Convergence state renders correctly

Uses `@testing-library/preact` for component rendering and interaction.

## Accessibility Tests

### Layout Audit (`tests/a11y/layout.test.ts`)

Runs axe-core against rendered page layouts to verify WCAG 2.1 AA compliance:
- Color contrast ratios
- ARIA attribute correctness
- Heading hierarchy
- Form label associations
- Image alt text presence
- Focus management

## Running Tests

```bash
cd site

# Run all tests
npm run test:unit && npm run test:integration && npm run test:a11y

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:a11y
```

## Test Dependencies

| Package | Purpose |
|---------|---------|
| `vitest` | Test runner and assertion library |
| `@testing-library/preact` | Component rendering and interaction |
| `@testing-library/jest-dom` | DOM assertion matchers |
| `happy-dom` | Lightweight DOM implementation |
| `axe-core` | WCAG accessibility audit engine |
| `vitest-axe` | Vitest integration for axe-core |

## Writing New Tests

### Unit Tests

Place in `tests/unit/`. Use Node environment. Test pure functions only -- no DOM, no components.

### Integration Tests

Place in `tests/integration/`. Use happy-dom environment. Test component rendering and user interaction with `@testing-library/preact`.

### Accessibility Tests

Place in `tests/a11y/`. Use happy-dom environment. Render layouts/pages and run axe-core audits.
