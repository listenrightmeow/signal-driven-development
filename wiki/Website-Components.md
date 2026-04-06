# Website Components

The SDD website uses a mix of static Astro components and interactive Preact islands. Interactive components ship JavaScript only where needed.

## Interactive Components (Preact Islands)

### Walkthrough (`Walkthrough.tsx`)

The flagship interactive component. Simulates the gap resolution process using real data from the veterinary clinic example.

**Features:**

- Tabs for Pass 1, 2, and 3
- Left panel: gap list with selection
- Right panel: gap detail (rule, analysis, recommendation)
- Resolve button to mark gaps complete
- Progress tracking with advance button to next pass
- Final convergence state when all gaps resolved

**State management:** Uses a pure state machine (`walkthrough-state.ts`) with functions:

- `createWalkthroughState()` -- Initialize state
- `resolveGap()` -- Mark a gap as resolved
- `selectGap()` -- Select a gap for detail view
- `canAdvancePass()` -- Check if all gaps in current pass are resolved
- `advancePass()` -- Move to next pass
- `getProgress()` -- Calculate completion percentage
- `isConverged()` -- Check if final pass has zero gaps

**Accessibility:**

- ARIA labels on all interactive elements
- Live regions for state change announcements
- Full keyboard navigation support

**Data source:** `src/data/walkthrough.json` with TypeScript types in `walkthrough.types.ts`

### LineageTimeline (`LineageTimeline.tsx`)

Interactive timeline of DDD influences from 2003 to 2026.

**Features:**

- Click to select nodes and view connections
- Filter by authority (Evans, Vernon, Brandolini, etc.)
- Track lines showing author lineage
- Influence arcs showing conceptual dependencies
- 10+ contributors tracked

**Data source:** `src/data/lineage.json`

## Static Components (Astro)

### Hero (`Hero.astro`)

Homepage hero section with headline, description, and call-to-action buttons. Includes a ghost-accent button style for the Facet CTA.

### Nav (`Nav.astro`)

Site navigation component. Clean, semantic HTML with links to all pages.

### StatsBar (`StatsBar.astro`)

Displays key methodology statistics:

- Domains analyzed
- Total gaps identified and resolved
- Convergence rate

### ConvergenceViz (`ConvergenceViz.astro`)

SVG visualization of the three-pass convergence trajectory. Shows gap count decreasing across passes with visual indicators.

## State Machine Architecture

The walkthrough state machine is pure functional -- no side effects, no external dependencies. This enables:

- **Testability** -- state transitions are pure functions, trivially unit-testable
- **Predictability** -- given the same state and action, the result is always the same
- **Debuggability** -- state can be serialized and inspected at any point

```typescript
// Pure state transition
const nextState = resolveGap(currentState, gapId);

// Query functions
const progress = getProgress(state);
const canAdvance = canAdvancePass(state);
const converged = isConverged(state);
```

## Component Testing

All interactive components have corresponding tests:

| Component | Test File | Test Type |
|-----------|-----------|-----------|
| Walkthrough state machine | `tests/unit/walkthrough-state.test.ts` | Unit |
| LineageTimeline state | `tests/unit/lineage-state.test.ts` | Unit |
| Walkthrough rendering | `tests/integration/walkthrough.test.tsx` | Integration |
| Layout accessibility | `tests/a11y/layout.test.ts` | Accessibility |

See [[Testing Strategy]] for details.
