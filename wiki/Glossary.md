# Glossary

Key terms used throughout Signal-Driven Development and this wiki.

## SDD-Specific Terms

| Term | Definition |
|------|-----------|
| **Convergence** | The process of iteratively reducing gap count to zero across passes. A model has converged when zero unresolved gaps remain. |
| **Convergence invariant** | The rule that gap count must decrease across passes. Violation indicates the specification is diverging. |
| **Divergence** | When gap count increases between passes. The most important signal the process can produce -- indicates a resolution introduced more complexity than it removed. |
| **Gap** | A diagnostic signal identified during a gap report. Not a verdict -- the architect reads, investigates, and resolves. |
| **Gap report** | An immutable snapshot evaluating a domain specification against four gap categories (SG, HG, LG, DG). |
| **Gap resolution log** | An immutable snapshot documenting how each gap was resolved, with rationale and structural impact. |
| **Pass** | One complete iteration of the convergence cycle: write/update specification, run gap report, resolve gaps. |
| **Signal** | Information surfaced by the gap report that the architect must investigate. Gaps are signals, not verdicts. |

## Gap Categories

| Term | Definition |
|------|-----------|
| **Structural Gap (SG)** | A missing or malformed element in the domain specification. Binary -- the element exists or it does not. |
| **Heuristic Gap (HG)** | A pattern that violates an established DDD principle with a measurable threshold. |
| **Language Gap (LG)** | Ambiguity or inconsistency in the ubiquitous language across the specification. |
| **Decision Gap (DG)** | An architectural decision that has been deferred or made without documented rationale. |

## Severity Levels

| Term | Definition |
|------|-----------|
| **ERROR** | A structural deficiency that will cause ambiguity or failure during implementation. Must be resolved. |
| **WARNING** | A pattern that may cause problems or violates a known heuristic. Should be investigated. |

## DDD Building Blocks

| Term | Definition |
|------|-----------|
| **Aggregate** | A cluster of domain objects treated as a single unit for consistency. Protects invariants through a consistency boundary. |
| **Bounded context** | A boundary within which a domain model applies. Each context has its own ubiquitous language. |
| **Command** | An instruction to perform an action that changes state. Directed at an aggregate. |
| **Domain event** | A record of something that happened in the domain. Emitted by aggregates after state changes. |
| **Domain service** | Coordinates domain logic that doesn't belong to a single aggregate. |
| **Invariant** | A business rule that must always be true within an aggregate's consistency boundary. |
| **Policy** | A reactive pattern: one event in, one command out. Represents a domain rule that governs when a reaction occurs. |
| **Projection** | A read model built by consuming domain events. Serves queries and views. |
| **Saga** | A multi-step process coordinating commands across aggregates with compensation logic for failures. |
| **Ubiquitous language** | The shared vocabulary between developers and domain experts within a bounded context. |
| **Value object** | An immutable domain object defined by its attributes rather than identity. |

## Context Relationship Types

| Term | Definition |
|------|-----------|
| **ACL (Anti-Corruption Layer)** | A translation layer that protects a context from changes in another context's model. |
| **Conformist** | A downstream context that conforms to the upstream context's model without translation. |
| **Customer-Supplier** | An upstream-downstream relationship where the supplier serves the customer's needs. |
| **Partnership** | Two contexts that coordinate changes together for mutual benefit. |
| **Published Language** | A well-documented, shared language for inter-context communication. |
| **Shared Kernel** | A subset of the domain model shared between two contexts, with coordinated changes. |

## Resolution Outcomes

| Term | Definition |
|------|-----------|
| **Accept** | The gap recommendation is adopted and the specification is changed accordingly. |
| **Accept with modification** | The recommendation is correct in principle but adjusted in execution. |
| **Reject** | The current design is intentional. The rationale for rejection is documented. |
