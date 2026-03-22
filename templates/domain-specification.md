# Domain Specification — [Domain Name] (Pass N)

> **Source Input**: [PRD, requirements, process descriptions, etc.]
> **Pass**: [1, 2, 3, ...]
> **Date**: [YYYY-MM-DD]
> **Status**: [Draft | Gap report pending | Converged]

---

## Bounded Contexts

### [Context Name]

**Responsibility**: [One sentence describing what this context owns]
**Upstream dependencies**: [Which contexts this context consumes from]
**Downstream consumers**: [Which contexts consume from this context]
**Relationship type**: [Partnership | Customer-Supplier | Conformist | ACL | Published Language | Shared Kernel]

---

## Building Block Inventory

| Building Block | Pass N Count |
|----------------|-------------|
| Bounded Contexts | |
| Aggregates | |
| Domain Services | |
| Value Objects | |
| Commands | |
| Domain Events | |
| Policies | |
| Sagas | |
| Projections | |
| Invariants | |

---

## Aggregates

### [Aggregate Name] — [Context Name]

**Identity**: [How instances are uniquely identified]
**Responsibility**: [What consistency boundary this aggregate protects]

**Commands**:

- `[CommandName]` — [What it does]. Preconditions: [What must be true]. Emits: `[EventName]`.

**Domain Events**:

- `[EventName]` — [What happened]. Payload: [Key fields].

**Invariants**:

- `INV-[XX]-[NN]`: [The rule that must always be true within this aggregate's consistency boundary]

---

## Domain Services

### [Service Name] — [Context Name]

**Responsibility**: [What domain logic this service coordinates that doesn't belong to a single aggregate]
**Consumes**: [Events or commands that trigger this service]
**Produces**: [Events or commands this service emits]

---

## Policies

### [Policy Name] — [Context Name]

**Trigger**: `[EventName]`
**Action**: [What the policy does in response — typically issues a command]
**Rule**: [The business rule that governs when this reaction occurs]

---

## Sagas

### [Saga Name] — [Context Name]

**Trigger**: `[EventName]`
**Steps**: [The ordered sequence of commands and compensating actions]
**Completion**: `[CompletionEventName]`
**Compensation**: [What happens when a step fails]

---

## Projections

### [Projection Name] — [Context Name]

**Purpose**: [What read model this projection builds]
**Consumes**: [Which events feed this projection]
**Serves**: [Which queries or views this projection supports]

---

## Design Principles

1. [Any domain-specific design decisions that apply across the specification]

---

## Glossary

| Term | Definition | Context |
|------|-----------|---------|
| | | [Which bounded context this definition applies within] |
