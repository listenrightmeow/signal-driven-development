# Template: Architecture Palette

**File:** `templates/architecture-palette.md`

The architecture palette is a visual projection of the domain specification. It transforms the textual model into a diagram that reveals patterns invisible in prose -- an aggregate connected to everything, a context with no outbound events, a saga that spans contexts unnecessarily.

## Purpose

The palette is both a **communication artifact** and a **verification surface**:

- **Communication**: Stakeholders can see the domain model at a glance without reading the full specification
- **Verification**: Visual patterns surface gaps that text cannot -- imbalanced contexts, isolated aggregates, missing reactive chains

## Structure

### Layout

Horizontal swimlane per bounded context. Inside each swimlane, building blocks are arranged to show the reactive chain:

```text
Command → Aggregate → Domain Event → Policy/Saga → Command
```

### Visual Conventions

| Element | Shape | Notes |
|---------|-------|-------|
| **Aggregates** | Rectangles | Name + invariant count |
| **Commands** | Arrows into aggregates | |
| **Domain Events** | Arrows out of aggregates | |
| **Policies** | Diamonds | Single event in, single command out |
| **Sagas** | Rounded rectangles | Multiple steps shown |
| **Projections** | Parallelograms | Events in, queries out |
| **Cross-context flows** | Dashed lines | Labeled with relationship type |

### Example Layout

```text
[Context A]
  Command → Aggregate → Event
                          ↓
[Context B]        Policy → Command → Aggregate → Event
                                                    ↓
[Context C]                                  Saga → Command (step 1)
                                                  → Command (step 2)
                                                  → Completion Event
```

### Building Block Summary

| Context | Aggregates | Commands | Events | Policies | Sagas | Projections | Invariants |
|---------|-----------|----------|--------|----------|-------|-------------|------------|
| | | | | | | | |
| **Total** | | | | | | | |

### Observations

Note any visual patterns the palette reveals:

- Imbalanced contexts (one context with 80% of the building blocks)
- Isolated aggregates (no inbound commands or outbound events)
- Missing reactive chains (events with no consumers)
- Cross-context coupling patterns

## Implementation

Use any diagramming tool:

- **Mermaid** (recommended -- renders in GitHub, can be embedded in markdown)
- Whiteboard or physical drawing
- Excalidraw, draw.io, or other diagramming software

The worked example uses Mermaid. See [[Worked Example: Veterinary Clinic]] for a complete architecture palette.

## When to Create

The architecture palette is **optional but valuable**:

- **Simple domains** (1--2 contexts): May not need a visual projection
- **Complex domains** (3+ contexts): Strongly recommended
- **Final convergence pass**: Best created at Pass 3 when the model is stable

Creating the palette too early (Pass 1) may waste effort since the model will change significantly. Creating it at convergence provides a stable verification surface.
