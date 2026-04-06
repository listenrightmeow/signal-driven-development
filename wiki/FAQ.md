# FAQ

Frequently asked questions about Signal-Driven Development.

---

## Is SDD only for Domain-Driven Design?

SDD was designed for DDD and uses DDD building blocks (aggregates, bounded contexts, commands, events). The gap categories and heuristic thresholds are grounded in DDD literature. If your architecture does not use DDD patterns, the templates will not apply directly. However, the core idea -- iterative specification with diagnostic feedback and a measurable definition of done -- could be adapted to other modeling approaches.

## Does SDD require a team?

No. SDD was specifically designed for solo practitioners. Traditional DDD knowledge crunching assumes collaborative workshops (EventStorming, domain expert interviews). SDD replaces the social feedback loop with a structured diagnostic one. A solo builder writes the specification, runs the gap report, and resolves the gaps. The gap report acts as the "second pair of eyes."

That said, SDD works with teams too. The templates serve as shared artifacts for review and discussion.

## How long does a pass take?

It depends on domain complexity. For a moderately complex domain (4--6 bounded contexts, 6--10 aggregates):

| Pass | Duration | What Happens |
|------|----------|--------------|
| Pass 1 | 2--4 hours | Initial extraction and gap report |
| Pass 2 | 1--2 hours | Resolution and re-evaluation |
| Pass 3 | 30--60 minutes | Final convergence check |

Simple domains may converge in two passes. Complex domains (regulatory, event-sourced, multi-team) may need four or five.

## Can I use SDD with AI assistants?

Yes. The structured templates work well with AI assistants for gap identification and resolution drafting. The architect retains decision authority -- the AI surfaces signals, the architect investigates and decides. This was part of the original motivation for SDD: creating a methodology that works with AI as a modeling partner.

## What if my gap count increases between passes?

This is a **divergence signal** -- the most important signal the process can produce. It means a resolution introduced more complexity than it removed. Common causes:

- A boundary change that created new cross-context dependencies
- An aggregate decomposition that generated more questions than it answered
- A scope expansion disguised as a gap resolution

Investigate the root cause. Revert the resolution that caused divergence if needed. The convergence invariant is non-negotiable. See [[Convergence Model]] for details.

## Do I need all four templates for every domain?

| Template | Required? | Notes |
|----------|-----------|-------|
| Domain Specification | Yes | The core artifact |
| Gap Report | Yes | The diagnostic tool |
| Gap Resolution Log | Strongly recommended | Captures rationale you'll forget in two weeks |
| Architecture Palette | Optional | Valuable for complex domains (3+ contexts) |

## When is a model "done"?

When the gap report returns zero unresolved gaps. This does not mean the model is perfect. It means every question the model raised has been answered -- either by changing the specification or by documenting why the current design is intentional. Deferred items (e.g., "V2 scope") are not gaps; they are conscious scope boundaries.

## How does SDD relate to EventStorming?

They are complementary:

- **EventStorming** is a **discovery** technique -- it helps you find domain events and command flows through collaborative workshops
- **SDD** is a **convergence** technique -- it takes a domain specification (however you produced it) and drives it to completeness through diagnostic passes

You could use EventStorming for discovery and SDD for convergence.

## Can I contribute a worked example?

Yes. See [[Contributing]] for guidelines on submitting anonymized domain analyses.

## Where do the heuristic thresholds come from?

Each threshold is sourced from the DDD literature:

| Threshold | Source |
|-----------|--------|
| Aggregate command density (6) | Vernon, *Implementing DDD* |
| Context term overlap (3) | Evans, *Domain-Driven Design* |
| Saga step count (5) | Practical production experience |
| Aggregates per context (3) | Context size heuristic |
| Policy fan-out (1:1) | EventStorming vocabulary |

Thresholds can be overridden with documented rationale. See [[Heuristic Thresholds]] for the full reference.
