# Signal-Driven Development (SDD)

A solo-practitioner methodology for rigorous Domain-Driven Design with a measurable definition of done.

## What is SDD?

Signal-Driven Development extends DDD with a structured convergence process, diagnostic feedback loops, and a definition of done that DDD has never had: **zero unresolved gaps**.

SDD was developed through months of rigorous domain modeling across production systems — complex domains with regulatory concerns, event-sourced architectures, and cross-context dependencies. The methodology emerged from practice, not theory.

Read the full introduction: [Introducing Signal-Driven Development](https://listenrightmeow.hashnode.dev/introducing-signal-driven-development)

## Core Concepts

**Three-Pass Convergence** — Every domain goes through iterative passes. Each pass produces a domain specification, a gap report, and a gap resolution log. The gap count must decrease across passes. The definition of done is zero unresolved gaps.

**Gap Reports as Diagnostic Signals** — A gap report evaluates a domain specification against three categories: structural completeness (are the elements present?), heuristic thresholds (do the patterns honor established DDD principles?), and methodology process (is the modeling discipline sound?). Gaps are signals, not verdicts. The architect reads, investigates, and resolves.

**Architecture Palette** — A visual projection of the domain specification in DDD building blocks, organized by bounded context. Communication artifact and verification surface.

## How to Use This Repository

### 1. Start with the templates

Copy the templates from `templates/` into your project:

- `gap-report.md` — Structure for evaluating your domain specification
- `gap-resolution-log.md` — Structure for documenting how you resolved each gap
- `domain-specification.md` — Structure for your domain model expressed in DDD building blocks
- `architecture-palette.md` — Structure for the visual projection

### 2. Study the worked example

The `examples/veterinary-clinic/` directory contains a complete three-pass convergence on a fictional veterinary clinic domain. It demonstrates:

- Pass 1: Initial domain extraction with 18 gaps identified
- Pass 2: Gap resolution driving architectural decisions, reducing to 5 gaps
- Pass 3: Final convergence to zero unresolved gaps

### 3. Run a pass on your own domain

Pick a bounded context in your system. Write the domain specification — name everything, place everything, make every relationship explicit. Then run the gap report template against it. The gaps will tell you what you didn't know you hadn't decided.

## The Convergence Trajectory

Across eight production domains, the typical trajectory looks like this:

| Pass | Typical Gap Count | What Happens |
|------|-------------------|--------------|
| 1 | 15–35 | Initial extraction. Structural errors, missing invariants, heuristic violations surface. |
| 2 | 5–10 | Focused resolution. Real architectural decisions get made and documented. |
| 3 | 0–3 | Final convergence. Residual tradeoffs resolved or consciously accepted. |

Some domains require 4–5 passes. The invariant is convergence: each pass must reduce the gap count. If it doesn't, the specification is diverging — and that non-convergence is the most important signal the process can produce.

## Gap Categories

### Structural Gaps (SG)

Missing or malformed elements in the domain specification. Binary — the element exists or it doesn't.

Examples: aggregate without invariants, command without corresponding domain event, bounded context with no explicit relationships declared.

### Heuristic Gaps (HG)

Patterns that violate established DDD principles from Evans, Vernon, Brandolini, and others. Each has a measurable threshold.

Examples: aggregate command density exceeding 6 (Vernon), context term overlap exceeding 3 shared definitions (Evans), saga step count exceeding 5.

### Language Gaps (LG)

Ambiguity or inconsistency in the ubiquitous language across the specification.

Examples: same term used with different definitions across contexts without explicit homonym declaration, unnamed concepts referenced in multiple places.

### Decision Gaps (DG)

Architectural decisions that have been deferred or made without documented rationale.

Examples: bounded context boundary that could reasonably be drawn in two places, aggregate decomposition with undocumented tradeoffs.

## Lineage

SDD builds on the work of the DDD community:

- [Eric Evans](https://www.domainlanguage.com/) — Domain-Driven Design (2004). The building blocks and strategic patterns.
- [Vaughn Vernon](https://www.amazon.com/Implementing-Domain-Driven-Design-Vaughn-Vernon/dp/0321834577) — Implementing DDD (2013). Tactical guidance and the small aggregate heuristic.
- [Alberto Brandolini](https://www.eventstorming.com/) — EventStorming. Collaborative discovery vocabulary.
- [Vlad Khononov](https://www.informit.com/store/balancing-coupling-in-software-design-universal-design-9780137353538) — Balancing Coupling in Software Design (2024). Coupling as measurable heuristic.
- [Narrative-Driven Development](https://narrativedriven.org/) — Temporal vocabulary and the moment primitive.

SDD doesn't replace any of this. It adds a feedback loop and a definition of done.

## Blog Series

This repository accompanies a blog series on DDD, AI, and Signal-Driven Development:

1. [DDD Has a Solo-Builder Problem](https://listenrightmeow.hashnode.dev/ddd-has-a-solo-builder-problem)
2. [Knowledge Crunching Doesn't Need a Room](https://listenrightmeow.hashnode.dev/knowledge-crunching-doesnt-need-a-room)
3. [The Reactive Path Has No Vocabulary](https://listenrightmeow.hashnode.dev/the-reactive-path-has-no-vocabulary)
4. [Introducing Signal-Driven Development](https://listenrightmeow.hashnode.dev/introducing-signal-driven-development)
5. [The Gap Report: DDD's Missing Feedback Loop](https://listenrightmeow.hashnode.dev/the-gap-report-ddds-missing-feedback-loop)

## License

MIT — Use these templates however you want. Attribution appreciated.
