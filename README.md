<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="site/public/img/sdd-wordmark.svg">
    <source media="(prefers-color-scheme: light)" srcset="site/public/img/sdd-wordmark-dark.svg">
    <img alt="SDD — Signal-Driven Development" src="site/public/img/sdd-wordmark-dark.svg" width="200">
  </picture>
</p>

<h1 align="center">Signal-Driven Development</h1>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Methodology Version](https://img.shields.io/badge/methodology-v1.0.0-green.svg)](CHANGELOG.md)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

**A solo-practitioner methodology for rigorous Domain-Driven Design with a measurable definition of done: zero unresolved gaps.**

---

## Table of Contents

- [What is SDD?](#what-is-sdd)
- [The Convergence Trajectory](#the-convergence-trajectory)
- [Quick Start](#quick-start)
- [Gap Categories](#gap-categories)
- [How to Use This Repository](#how-to-use-this-repository)
- [Repository Structure](#repository-structure)
- [Lineage](#lineage)
- [Blog Series](#blog-series)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

---

## What is SDD?

Signal-Driven Development extends DDD with a structured convergence process, diagnostic feedback loops, and a definition of done that DDD has never had: **zero unresolved gaps**.

SDD was developed through months of rigorous domain modeling across production systems — complex domains with regulatory concerns, event-sourced architectures, and cross-context dependencies. The methodology emerged from practice, not theory.

Every domain goes through iterative passes. Each pass produces a domain specification, a gap report, and a gap resolution log. Gaps are signals, not verdicts. The architect reads, investigates, and resolves. The gap count must decrease across passes. The process terminates when no unresolved gaps remain.

Read the full introduction: [Introducing Signal-Driven Development](https://listenrightmeow.hashnode.dev/introducing-signal-driven-development)

---

## The Convergence Trajectory

Across eight production domains, the typical trajectory:

| Pass | Typical Gap Count | What Happens |
|------|-------------------|--------------|
| 1 | 15-35 | Initial extraction. Structural errors, missing invariants, heuristic violations surface. |
| 2 | 5-10 | Focused resolution. Real architectural decisions get made and documented. |
| 3 | 0-3 | Final convergence. Residual tradeoffs resolved or consciously accepted. |

Some domains require 4-5 passes. The invariant is convergence: each pass must reduce the gap count. If it doesn't, the specification is diverging — and that non-convergence is the most important signal the process can produce.

See the [convergence flow diagram](docs/convergence-flow.md) for a visual overview.

---

## Quick Start

1. Copy the templates from `templates/` into your project
2. Write a domain specification for one bounded context
3. Run the gap report against it
4. Resolve each gap with rationale
5. Repeat until zero gaps

See the full [Quick Start Guide](docs/quickstart.md) for a detailed walkthrough, or use the scaffolding script:

```bash
./scripts/init-domain.sh "My Project" 1
```

---

## Gap Categories

SDD evaluates domain specifications against four categories:

### Structural Gaps (SG)

Missing or malformed elements. Binary — the element exists or it doesn't. Example: an aggregate without invariants.

### Heuristic Gaps (HG)

Patterns that violate established DDD principles from Evans, Vernon, Brandolini, and others. Each has a measurable threshold. Example: aggregate command density exceeding 6.

### Language Gaps (LG)

Ambiguity or inconsistency in the ubiquitous language. Example: same term used with different definitions across contexts.

### Decision Gaps (DG)

Architectural decisions deferred or made without documented rationale. Example: a boundary that could be drawn two ways.

See the full [Gap Categories Reference](docs/gap-categories.md) for detailed definitions, examples, and heuristic thresholds.

---

## How to Use This Repository

### 1. Start with the templates

Copy the templates from `templates/` into your project:

- `domain-specification.md` — Structure for your domain model in DDD building blocks
- `gap-report.md` — Structure for evaluating your specification against the four gap categories
- `gap-resolution-log.md` — Structure for documenting how you resolved each gap
- `architecture-palette.md` — Structure for the visual projection

### 2. Study the worked example

The `examples/veterinary-clinic/` directory contains a **complete three-pass convergence** on a fictional veterinary clinic domain:

- **Pass 1**: Initial domain extraction with 18 gaps identified
- **Pass 2**: Gap resolution driving architectural decisions, reducing to 5 gaps
- **Pass 3**: Final convergence to zero unresolved gaps — including the complete domain specification and architecture palette

### 3. Run a pass on your own domain

Pick a bounded context in your system. Write the domain specification — name everything, place everything, make every relationship explicit. Then run the gap report template against it. The gaps will tell you what you didn't know you hadn't decided.

---

## Repository Structure

```text
signal-driven-development/
  templates/
    domain-specification.md      # Template for expressing the domain model
    gap-report.md                # Template for diagnostic evaluation
    gap-resolution-log.md        # Template for resolution decisions
    architecture-palette.md      # Template for visual projection
  examples/
    veterinary-clinic/           # Complete 3-pass worked example
      README.md
      pass-1/                    # 18 gaps identified
      pass-2/                    # Reduced to 5 gaps
      pass-3/                    # Converged: 0 gaps + final spec + palette
  docs/
    quickstart.md                # 5-minute getting started guide
    gap-categories.md            # Detailed gap category reference
    convergence-flow.md          # Visual convergence process (Mermaid)
    faq.md                       # Frequently asked questions
  scripts/
    init-domain.sh               # Scaffold a new domain analysis
  CONTRIBUTING.md                # How to contribute
  CODE_OF_CONDUCT.md             # Community standards
  CHANGELOG.md                   # Methodology version history
```

---

## Lineage

SDD builds on the work of the DDD community:

- [Eric Evans](https://www.domainlanguage.com/) — Domain-Driven Design (2004). The building blocks and strategic patterns.
- [Vaughn Vernon](https://www.amazon.com/Implementing-Domain-Driven-Design-Vaughn-Vernon/dp/0321834577) — Implementing DDD (2013). Tactical guidance and the small aggregate heuristic.
- [Alberto Brandolini](https://www.eventstorming.com/) — EventStorming. Collaborative discovery vocabulary.
- [Vlad Khononov](https://www.informit.com/store/balancing-coupling-in-software-design-universal-design-9780137353538) — Balancing Coupling in Software Design (2024). Coupling as measurable heuristic.
- [Narrative-Driven Development](https://narrativedriven.org/) — Temporal vocabulary and the moment primitive.

SDD doesn't replace any of this. It adds a feedback loop and a definition of done.

---

## Blog Series

This repository accompanies a blog series on DDD, AI, and Signal-Driven Development:

1. [DDD Has a Solo-Builder Problem](https://listenrightmeow.hashnode.dev/ddd-has-a-solo-builder-problem)
2. [Knowledge Crunching Doesn't Need a Room](https://listenrightmeow.hashnode.dev/knowledge-crunching-doesnt-need-a-room)
3. [The Reactive Path Has No Vocabulary](https://listenrightmeow.hashnode.dev/the-reactive-path-has-no-vocabulary)
4. [Introducing Signal-Driven Development](https://listenrightmeow.hashnode.dev/introducing-signal-driven-development)
5. [The Gap Report: DDD's Missing Feedback Loop](https://listenrightmeow.hashnode.dev/the-gap-report-ddds-missing-feedback-loop)

---

## FAQ

**Is SDD only for DDD?** Yes — the templates use DDD building blocks. The convergence idea could be adapted, but the templates are DDD-specific.

**Does it require a team?** No. SDD was designed for solo practitioners. The gap report replaces the social feedback loop.

**How long does a pass take?** For a moderately complex domain: Pass 1 is 2-4 hours, Pass 2 is 1-2 hours, Pass 3 is 30-60 minutes.

**Can I use it with AI assistants?** Yes. The structured templates work well with AI for gap identification and resolution drafting. The architect retains decision authority.

See the full [FAQ](docs/faq.md) for more.

---

## Contributing

Contributions are welcome — especially worked examples from your own domains (anonymized). See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT — Use these templates however you want. Attribution appreciated.
