# Gap Categories

Signal-Driven Development evaluates domain specifications against four gap categories. Each gap is a diagnostic signal -- not a verdict. The architect reads, investigates, and resolves.

## Overview

| Category | Code | Nature | Typical Severity |
|----------|------|--------|-----------------|
| **Structural Gaps** | SG | Missing or malformed elements | ERROR or WARNING |
| **Heuristic Gaps** | HG | Patterns violating DDD principles | WARNING |
| **Language Gaps** | LG | Ubiquitous language ambiguity | WARNING |
| **Decision Gaps** | DG | Undocumented architectural decisions | WARNING or ERROR |

See also: [[Severity Model]] for ERROR vs WARNING definitions, [[Heuristic Thresholds]] for measurable threshold values.

---

## Structural Gaps (SG)

Missing or malformed elements in the domain specification. Binary -- the element exists or it does not.

### Rule

Every DDD building block that is referenced must be fully defined. Every aggregate must protect at least one invariant. Every cross-context dependency must declare a relationship type.

### Examples

| ID | Description | Severity |
|----|-------------|----------|
| SG-01 | Aggregate with zero invariants -- no consistency boundary to enforce | ERROR |
| SG-02 | Command with no corresponding domain event | ERROR |
| SG-03 | Bounded context with no declared relationships to other contexts | WARNING |
| SG-04 | Projection consuming events from a context with no declared upstream relationship | WARNING |
| SG-05 | Policy modeled for an infrastructure concern (notifications, logging) rather than a domain reaction | WARNING |

### What to Look For

- Aggregates that are data containers (many fields, no invariants)
- Commands without preconditions
- Events that no one consumes
- Context relationships described in prose but not formally declared
- Missing entry paths described in requirements but absent from the specification

---

## Heuristic Gaps (HG)

Patterns that violate established DDD principles. Each has a measurable threshold sourced from the DDD literature. See [[Heuristic Thresholds]] for the full table.

### Examples

| ID | Description | Severity |
|----|-------------|----------|
| HG-01 | Aggregate with 8 commands -- exceeds Vernon's density threshold | WARNING |
| HG-02 | Sequential command pipeline on a single aggregate -- suggests saga pattern | WARNING |
| HG-03 | Zero sagas in a domain with multi-step cross-aggregate processes | WARNING |
| HG-04 | Same term used with different meanings in 4 contexts without explicit homonym declaration | WARNING |
| HG-05 | Two aggregates in the same context that always change together -- potential over-separation | WARNING |

### What to Look For

- Aggregates doing too much (high command count, many responsibilities)
- Missing sagas where cross-aggregate coordination exists
- Policies chained in sequence (A triggers B triggers C) -- often a saga in disguise
- Contexts with too many aggregates (sign of a missing context boundary)

---

## Language Gaps (LG)

Ambiguity or inconsistency in the ubiquitous language across the specification.

### Rule

Every term in the specification must have exactly one meaning within its bounded context. Terms shared across contexts must either have explicitly different definitions (declared homonyms) or identical definitions (shared kernel).

### Examples

| ID | Description | Severity |
|----|-------------|----------|
| LG-01 | Same term used with different definitions across contexts without declaration | WARNING |
| LG-02 | Aggregate name that overloads a common industry term | WARNING |
| LG-03 | Unnamed concept referenced in multiple places -- implicit term that needs explicit naming | WARNING |
| LG-04 | Glossary entry missing for a term used in commands or events | WARNING |
| LG-05 | Transition point between contexts uses different vocabulary on each side | WARNING |

### What to Look For

- Terms that mean different things to different people on the team
- Aggregate names that cause confusion when discussed with domain experts
- Implicit concepts (referenced but never named or defined)
- Glossary gaps -- terms used in commands/events but not formally defined

---

## Decision Gaps (DG)

Architectural decisions that have been deferred or made without documented rationale.

### Rule

Every boundary placement, aggregate decomposition, and relationship type must have a documented rationale. "It seemed right" is not a rationale. Deferred decisions must have an explicit scope note (e.g., "deferred to V2").

### Examples

| ID | Description | Severity |
|----|-------------|----------|
| DG-01 | Missing domain concept -- referenced in requirements but absent from the specification | ERROR |
| DG-02 | Bounded context boundary that could reasonably be drawn in two places | WARNING |
| DG-03 | Aggregate decomposition with undocumented tradeoffs | WARNING |
| DG-04 | Source of truth for a shared concept is ambiguous across contexts | WARNING |
| DG-05 | Scope decision not documented -- unclear what is V1 vs. deferred | WARNING |

### What to Look For

- "Where does X live?" questions with no clear answer
- Boundaries drawn by convention rather than analysis
- Pricing, scheduling, or access control models referenced but never defined
- Scope assumptions that exist only in someone's head

---

## Gap ID Conventions

Gap IDs follow the pattern `{CATEGORY}-{NUMBER}` or `{CATEGORY}-{PASS_PREFIX}-{NUMBER}`:

- `SG-01` -- Structural gap #1
- `HG-P2-01` -- Heuristic gap #1, identified in Pass 2
- `LG-03` -- Language gap #3
- `DG-02` -- Decision gap #2

## Gap Resolution Priorities

Each gap report includes a priority classification:

| Priority | Criteria | Rationale |
|----------|----------|-----------|
| **Must resolve this pass** | Structural integrity, foundational boundaries | Blocks further modeling |
| **Should resolve this pass** | Heuristic alignment, semantic clarity | Reduces future gap count |
| **Can defer to next pass** | Optimization, projection design | Low risk of divergence |
