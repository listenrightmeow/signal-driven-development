# Heuristic Thresholds

Heuristic gaps are patterns that violate established DDD principles. Unlike structural gaps (binary -- exists or doesn't), heuristic gaps are measured against thresholds sourced from the DDD literature.

## Threshold Table

| Heuristic | Threshold | Source | Rationale |
|-----------|-----------|--------|-----------|
| **Aggregate command density** | 6 or fewer commands per aggregate | Vernon, *Implementing DDD* | High command count signals an aggregate with too many responsibilities. Consider decomposition. |
| **Context term overlap** | 3 or fewer shared term definitions across contexts | Evans, *Domain-Driven Design* | Excessive term sharing suggests blurred context boundaries or a missing shared kernel. |
| **Saga step count** | 5 or fewer steps per saga | Practical experience across production systems | Long sagas are fragile and difficult to reason about. Consider decomposition into smaller coordinated processes. |
| **Aggregates per context** | 3 or fewer preferred | Context size heuristic | Too many aggregates in a single context may signal a missing boundary. |
| **Policy fan-out** | 1 event in, 1 command out | Policy simplicity principle | A policy should be a single reaction. Multiple outputs suggest a saga or orchestration pattern. |

## How Thresholds Work

Thresholds are defaults, not absolutes. When a threshold is exceeded:

1. The gap report flags it as a **WARNING** (not an error)
2. The architect investigates whether the violation is meaningful
3. Resolution options:
   - **Change the model** to bring the metric within threshold
   - **Override the threshold** with documented rationale explaining why the domain justifies the exception

Overriding a threshold is a valid architectural decision. The value of the threshold is not the number -- it's the investigation it triggers.

## Threshold Sources

### Eric Evans -- *Domain-Driven Design* (2004)

Evans established the principles of bounded contexts, ubiquitous language, and strategic design. The context term overlap threshold derives from his work on context boundaries and shared kernels.

### Vaughn Vernon -- *Implementing Domain-Driven Design* (2013)

Vernon provided tactical guidance for implementing DDD patterns. The aggregate command density threshold comes from his "small aggregate" heuristic -- aggregates should be small, focused consistency boundaries.

### Alberto Brandolini -- *EventStorming*

Brandolini's collaborative discovery vocabulary informs how we identify missing reactive patterns (policies and sagas). The policy fan-out threshold derives from EventStorming's "event triggers command" pattern.

### Vlad Khononov -- *Balancing Coupling in Software Design* (2024)

Khononov formalized coupling as a measurable heuristic. His work informs how SDD evaluates cross-context dependencies and relationship types.

## Adding Custom Thresholds

If your domain has specific heuristics that matter (e.g., regulatory constraints, performance budgets), you can add them to your gap report. Follow the same pattern:

1. Define the heuristic and its threshold
2. Cite the source (domain expertise, regulation, team agreement)
3. Measure against your specification
4. Flag violations as heuristic gaps
