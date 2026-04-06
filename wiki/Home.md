# Signal-Driven Development (SDD)

**A solo-practitioner methodology for rigorous Domain-Driven Design with a measurable definition of done: zero unresolved gaps.**

---

Signal-Driven Development extends DDD with a structured convergence process, diagnostic feedback loops, and a definition of done that DDD has never had. SDD was developed through months of rigorous domain modeling across production systems -- complex domains with regulatory concerns, event-sourced architectures, and cross-context dependencies. The methodology emerged from practice, not theory.

Every domain goes through iterative passes. Each pass produces a domain specification, a gap report, and a gap resolution log. Gaps are signals, not verdicts. The architect reads, investigates, and resolves. The gap count must decrease across passes. The process terminates when no unresolved gaps remain.

## The Convergence Trajectory

Across eight production domains, the typical trajectory:

| Pass | Typical Gap Count | What Happens |
|------|-------------------|--------------|
| 1 | 15--35 | Initial extraction. Structural errors, missing invariants, heuristic violations surface. |
| 2 | 5--10 | Focused resolution. Real architectural decisions get made and documented. |
| 3 | 0--3 | Final convergence. Residual tradeoffs resolved or consciously accepted. |

Some domains require 4--5 passes. The invariant is convergence: each pass must reduce the gap count. If it doesn't, the specification is diverging -- and that non-convergence is the most important signal the process can produce.

## Wiki Contents

### Methodology

- [[Methodology Overview]] -- What SDD is, why it exists, and how it works
- [[Convergence Model]] -- The iterative three-pass convergence process
- [[Gap Categories]] -- The four diagnostic categories (SG, HG, LG, DG)
- [[Heuristic Thresholds]] -- Measurable thresholds sourced from DDD literature
- [[Severity Model]] -- ERROR vs WARNING classifications
- [[Glossary]] -- Key terms and definitions

### Templates

- [[Templates Overview]] -- The four core SDD templates
- [[Template: Domain Specification]] -- Expressing the domain model in DDD building blocks
- [[Template: Gap Report]] -- Diagnostic evaluation against four gap categories
- [[Template: Gap Resolution Log]] -- Documenting resolution decisions with rationale
- [[Template: Architecture Palette]] -- Visual projection using Mermaid diagrams

### Worked Examples

- [[Worked Example: Veterinary Clinic]] -- Complete three-pass convergence (18 → 5 → 0 gaps)

### Getting Started

- [[Quick Start Guide]] -- Get started with SDD in five steps
- [[Scaffolding Script]] -- Automate domain analysis setup with `init-domain.sh`

### Website

- [[Website Architecture]] -- Astro static site with Preact islands
- [[Website Components]] -- Interactive components (Walkthrough, LineageTimeline)
- [[Website Performance]] -- Critical CSS, font loading, image optimization
- [[Website Design System]] -- Design tokens, dark/light theming
- [[Website SEO]] -- Semantic HTML, structured data, target keywords

### Development

- [[CI/CD Pipeline]] -- GitHub Actions workflows (lint, test, build)
- [[Testing Strategy]] -- Unit, integration, and accessibility tests
- [[Contributing]] -- How to contribute worked examples and improvements
- [[Changelog]] -- Methodology version history

### Community

- [[Lineage]] -- DDD community lineage and influences
- [[Blog Series]] -- Companion blog posts on Hashnode
- [[FAQ]] -- Frequently asked questions
