# Architecture Palette — [Domain Name] (Pass N)

> **Source**: Domain Specification — [Domain Name] (Pass N)
> **Date**: [YYYY-MM-DD]
> **Layout**: Horizontal swimlane per bounded context

---

## How to Read This Palette

The architecture palette is a visual projection of the domain specification. Each bounded context is a swimlane. Inside each swimlane, building blocks are arranged to show the flow: **Command → Aggregate → Domain Event → Policy/Saga → Command** (the reactive chain).

The palette is a communication artifact and a verification surface. Patterns that are invisible in a textual specification become obvious here — an aggregate connected to everything, a context with no outbound events, a saga that spans contexts unnecessarily.

---

## Palette

Use Mermaid, a whiteboard, or any diagramming tool. The structure is:

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

### Conventions

- **Aggregates**: Rectangles. Name + invariant count.
- **Commands**: Arrows into aggregates.
- **Domain Events**: Arrows out of aggregates.
- **Policies**: Diamonds. Single event in, single command out.
- **Sagas**: Rounded rectangles. Multiple steps shown.
- **Projections**: Parallelograms. Events in, queries out.
- **Cross-context flows**: Dashed lines with relationship type label.

---

## Building Block Summary by Context

| Context | Aggregates | Commands | Events | Policies | Sagas | Projections | Invariants |
|---------|-----------|----------|--------|----------|-------|-------------|------------|
| | | | | | | | |
| **Total** | | | | | | | |

---

## Observations

[Note any visual patterns that the palette reveals — imbalanced contexts, isolated aggregates, missing reactive chains, etc. These often surface gaps that the textual specification missed.]
