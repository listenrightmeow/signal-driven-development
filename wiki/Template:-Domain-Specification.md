# Template: Domain Specification

**File:** `templates/domain-specification.md`

The domain specification is the central artifact in SDD. It expresses the domain model using DDD building blocks -- bounded contexts, aggregates, commands, events, invariants, policies, sagas, and projections.

## Structure

The template is organized into these sections:

### 1. Metadata Header

```markdown
> **Source Input**: [PRD, requirements, process descriptions, etc.]
> **Pass**: [1, 2, 3, ...]
> **Date**: [YYYY-MM-DD]
> **Status**: [Draft | Gap report pending | Converged]
```

### 2. Bounded Contexts

Each context declares:

- **Responsibility** -- one sentence describing what this context owns
- **Upstream dependencies** -- which contexts this context consumes from
- **Downstream consumers** -- which contexts consume from this context
- **Relationship type** -- Partnership, Customer-Supplier, Conformist, ACL, Published Language, or Shared Kernel

### 3. Building Block Inventory

A summary table tracking counts across passes:

| Building Block | Count |
|----------------|-------|
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

### 4. Aggregates

Each aggregate defines:

- **Identity** -- how instances are uniquely identified
- **Responsibility** -- what consistency boundary this aggregate protects
- **Commands** -- what it does, preconditions, emitted events
- **Domain Events** -- what happened, payload fields
- **Invariants** -- rules that must always be true (using `INV-[XX]-[NN]` IDs)

### 5. Domain Services

Services that coordinate domain logic across aggregates:

- **Responsibility** -- what logic it coordinates
- **Consumes** -- events or commands that trigger it
- **Produces** -- events or commands it emits

### 6. Policies

Single-reaction domain rules:

- **Trigger** -- the event that activates the policy
- **Action** -- the command issued in response
- **Rule** -- the business rule governing when the reaction occurs

### 7. Sagas

Multi-step coordinated processes:

- **Trigger** -- the initiating event
- **Steps** -- ordered sequence of commands and compensating actions
- **Completion** -- the event emitted when the saga completes
- **Compensation** -- what happens when a step fails

### 8. Projections

Read models built from events:

- **Purpose** -- what read model this projection builds
- **Consumes** -- which events feed it
- **Serves** -- which queries or views it supports

### 9. Design Principles

Domain-specific design decisions that apply across the specification.

### 10. Glossary

| Term | Definition | Context |
|------|-----------|---------|
| | | [Which bounded context] |

## Writing Guidelines

### Pass 1: Extraction

- Name everything. Place everything. Make every relationship explicit.
- Do not aim for perfection -- the gap report will find what you missed.
- Focus on getting bounded contexts, aggregates, and their commands/events defined.
- Invariants are the hardest part -- most Pass 1 specifications have too few.

### Pass 2+: Resolution

- Incorporate all accepted resolutions from the previous gap resolution log.
- Track the building block inventory delta (what changed since last pass).
- New aggregates, decomposed aggregates, and redrawn boundaries are common.
- The glossary should grow with each pass.

## Invariant Naming Convention

Invariant IDs follow the pattern `INV-{AGGREGATE_ABBREVIATION}-{NUMBER}`:

- `INV-AP-01` -- First invariant on the Appointment aggregate
- `INV-TR-03` -- Third invariant on the Treatment aggregate
