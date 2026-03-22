# Convergence Flow

This diagram shows the iterative three-pass convergence process at the heart of Signal-Driven Development.

## Process Overview

```mermaid
flowchart TD
    A[Write Domain Specification] --> B[Run Gap Report]
    B --> C{Gaps found?}
    C -->|Yes| D[Write Gap Resolution Log]
    D --> E[Resolve each gap]
    E --> F[Update Domain Specification]
    F --> G{Gap count decreased?}
    G -->|Yes| B
    G -->|No| H[Specification is diverging]
    H --> I[Investigate root cause]
    I --> F
    C -->|Zero gaps| J[Model converged]
    J --> K[Implementation-ready]
```

## Key Decision Points

**"Gaps found?"** -- After running the gap report, if zero gaps remain, the model is converged. Every question the model raised has been answered.

**"Gap count decreased?"** -- This is the convergence invariant. Each pass must reduce the gap count. If it does not, the specification is diverging. Non-convergence is the most important signal the process can produce. It means a resolution introduced more complexity than it removed, and the root cause must be investigated.

## Typical Trajectory

```mermaid
graph LR
    P1["Pass 1<br/>15-35 gaps"] --> P2["Pass 2<br/>5-10 gaps"]
    P2 --> P3["Pass 3<br/>0-3 gaps"]
    P3 --> Done["Converged<br/>0 gaps"]
```

## Artifacts Per Pass

Each pass produces three artifacts:

| Artifact | Purpose |
|----------|---------|
| Domain Specification | The domain model expressed in DDD building blocks |
| Gap Report | Diagnostic evaluation against four gap categories |
| Gap Resolution Log | Decisions made against each gap with rationale |

The domain specification is the living document. It evolves across passes. The gap report and resolution log are snapshots -- they record what was found and what was decided at that point in time.
