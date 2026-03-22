# Quick Start Guide

Get started with Signal-Driven Development in five steps.

## Prerequisites

- A domain you want to model (even a small one works)
- Familiarity with basic DDD building blocks (aggregates, commands, events, bounded contexts)
- A text editor

## Step 1: Copy the Templates

Copy the four templates from `templates/` into your project:

```
my-project/
  pass-1/
    domain-specification.md
    gap-report.md
    gap-resolution-log.md
    architecture-palette.md
```

Or use the scaffolding script:

```bash
./scripts/init-domain.sh "My Project" 1
```

## Step 2: Write the Domain Specification

Open `domain-specification.md` and fill it in for your domain. Start with:

1. **Bounded contexts** -- Name each one, define its responsibility, and declare its relationships to other contexts.
2. **Aggregates** -- For each aggregate, define its identity, commands, domain events, and invariants.
3. **Policies and sagas** -- Document reactive behaviors (event triggers command).
4. **Glossary** -- Define every term in your ubiquitous language.

Do not aim for perfection. The point of Pass 1 is extraction -- get everything named and placed. The gap report will find what you missed.

## Step 3: Run the Gap Report

Open `gap-report.md` and evaluate your domain specification against the four gap categories:

- **Structural Gaps (SG)** -- Are all elements present? Does every aggregate have invariants? Does every command have a corresponding event?
- **Heuristic Gaps (HG)** -- Do patterns honor established DDD principles? Is aggregate command density reasonable? Are there sagas where needed?
- **Language Gaps (LG)** -- Is the ubiquitous language consistent? Are there overloaded terms?
- **Decision Gaps (DG)** -- Are there undocumented architectural decisions? Boundaries that could be drawn two ways?

Assign each gap an ID (e.g., `SG-01`), a severity (`ERROR` or `WARNING`), and a recommendation.

See [Gap Categories Reference](gap-categories.md) for detailed guidance and examples.

## Step 4: Resolve Each Gap

Open `gap-resolution-log.md` and work through every gap:

- **Accept** the recommendation and change the specification
- **Accept with modification** -- the recommendation is right but needs adjustment
- **Reject** -- document why the current design is intentional

Every resolution must include a rationale and its structural impact on the specification.

## Step 5: Run the Next Pass

Update your domain specification with all accepted resolutions. Increment the pass number. Run the gap report again.

The convergence invariant: **gap count must decrease across passes.** If it increases, the specification is diverging -- that non-convergence is itself the most important signal.

Repeat until zero unresolved gaps.

## Typical Trajectory

| Pass | Typical Gap Count | What Happens |
|------|-------------------|--------------|
| 1 | 15-35 | Initial extraction. Structural errors and missing invariants surface. |
| 2 | 5-10 | Focused resolution. Real architectural decisions get made. |
| 3 | 0-3 | Final convergence. Residual tradeoffs resolved or consciously accepted. |

## Next Steps

- Study the [veterinary clinic example](../examples/veterinary-clinic/) for a complete three-pass walkthrough
- Read the [convergence flow diagram](convergence-flow.md) for a visual overview
- See the [FAQ](faq.md) for common questions
