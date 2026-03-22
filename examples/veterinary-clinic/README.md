# Worked Example: Greenfield Veterinary Clinic

This example demonstrates Signal-Driven Development's three-pass convergence on a fictional veterinary clinic management system. The domain is simple enough to follow in one sitting but complex enough to surface real DDD gaps.

## The Domain

Greenfield Veterinary Clinic manages appointments, patient records (animals), treatments, and billing. Owners bring their animals for scheduled or emergency visits. Veterinarians diagnose, treat, and prescribe. The clinic bills per visit with itemized treatment costs.

## Convergence Trajectory

| Pass | Gaps | Errors | Warnings | Resolved |
|------|------|--------|----------|----------|
| 1 | 18 | 5 | 13 | 18/18 |
| 2 | 5 | 0 | 5 | 5/5 |
| 3 | 0 | 0 | 0 | — |

**Result**: Converged in 3 passes. 23 total gaps identified and resolved. Zero remaining.

## Files

Each pass directory contains:
- `domain-specification.md` — The domain model for that pass
- `gap-report.md` — The gaps identified against that specification
- `gap-resolution-log.md` — How each gap was resolved (Pass 1 and 2 only)

Pass 3 has only a domain specification and gap report (zero gaps = no resolution log needed).

## Key Lessons from This Example

1. **Pass 1 reveals structural debt.** An appointment aggregate with no invariants, a treatment aggregate doing the work of a saga, a billing context with no relationship to the rest of the model. These are the kinds of gaps that experienced architects catch intuitively — SDD makes them explicit.

2. **Pass 2 forces real decisions.** The boundary between Patient Records and Clinical Care had to be redrawn. The Treatment aggregate was decomposed into a saga. These aren't mechanical fixes — they're architectural decisions that required judgment and documented rationale.

3. **Pass 3 confirms convergence.** Zero gaps doesn't mean the model is perfect. It means every question the model raised has been answered. The architect either changed the specification or documented why the current design is intentional.
