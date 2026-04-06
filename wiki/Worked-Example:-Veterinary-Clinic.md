# Worked Example: Veterinary Clinic

The `examples/veterinary-clinic/` directory contains a complete three-pass convergence on a fictional veterinary clinic management system. The domain is simple enough to follow in one sitting but complex enough to surface real DDD gaps.

## The Domain

Greenfield Veterinary Clinic manages appointments, patient records (animals), treatments, and billing. Owners bring their animals for scheduled or emergency visits. Veterinarians diagnose, treat, and prescribe. The clinic bills per visit with itemized treatment costs.

## Convergence Trajectory

| Pass | Gaps | Errors | Warnings | Resolved |
|------|------|--------|----------|----------|
| 1 | 18 | 5 | 13 | 18/18 |
| 2 | 5 | 0 | 5 | 5/5 |
| 3 | 0 | 0 | 0 | -- |

**Result**: Converged in 3 passes. 23 total gaps identified and resolved. Zero remaining.

## Files

### Pass 1 -- Initial Extraction (18 gaps)

| File | Description |
|------|-------------|
| `pass-1/domain-specification.md` | The initial domain model |
| `pass-1/gap-report.md` | 18 gaps identified (5 errors, 13 warnings) |
| `pass-1/gap-resolution-log.md` | All 18 gaps resolved (16 accepted, 2 accepted with modification) |

### Pass 2 -- Focused Resolution (5 gaps)

| File | Description |
|------|-------------|
| `pass-2/domain-specification.md` | Updated model incorporating all Pass 1 resolutions |
| `pass-2/gap-report.md` | 5 remaining gaps (0 errors, 5 warnings) |
| `pass-2/gap-resolution-log.md` | All 5 gaps resolved |

### Pass 3 -- Final Convergence (0 gaps)

| File | Description |
|------|-------------|
| `pass-3/domain-specification.md` | The final converged domain model |
| `pass-3/gap-report.md` | Zero gaps -- model is implementation-ready |
| `pass-3/architecture-palette.md` | Visual projection of the final state (Mermaid) |

## Key Lessons

### 1. Pass 1 reveals structural debt

An appointment aggregate with no invariants, a treatment aggregate doing the work of a saga, a billing context with no relationship to the rest of the model. These are the kinds of gaps that experienced architects catch intuitively -- SDD makes them explicit.

### 2. Pass 2 forces real decisions

The boundary between Patient Records and Clinical Care had to be redrawn. The Treatment aggregate was decomposed into a saga. These aren't mechanical fixes -- they're architectural decisions that required judgment and documented rationale.

### 3. Pass 3 confirms convergence

Zero gaps doesn't mean the model is perfect. It means every question the model raised has been answered. The architect either changed the specification or documented why the current design is intentional.

### 4. Invariants are the signal of maturity

Pass 1 had 5 invariants across 6 aggregates. Pass 3 has 18 across 8. The growth from data containers to consistency boundaries is the clearest indicator of model quality.

## Building Block Evolution

| Building Block | Pass 1 | Pass 3 (Final) | Delta |
|----------------|--------|----------------|-------|
| Bounded Contexts | 4 | 4 | 0 |
| Aggregates | 6 | 8 | +2 |
| Commands | 14 | 21 | +7 |
| Events | 12 | 19 | +7 |
| Sagas | 0 | 1 | +1 |
| Invariants | 5 | 18 | +13 |

The most striking metric is the invariant growth: **+13 invariants** across three passes. This represents the transformation from aggregates-as-data-containers to aggregates-as-consistency-boundaries -- the defining characteristic of a mature domain model.

## Using This Example

This example is the recommended way to learn SDD:

1. **Read Pass 1** -- see what a first extraction looks like and what the gap report surfaces
2. **Study the Pass 1 resolution log** -- understand how each gap was resolved and why
3. **Compare Pass 1 and Pass 2 specifications** -- see how resolutions changed the model
4. **Read the Pass 3 architecture palette** -- see the final converged model visually
5. **Apply to your own domain** -- use the [[Quick Start Guide]] to run SDD on your own system

## Submitting Your Own Example

Worked examples from real domains (anonymized) are welcome. See [[Contributing]] for guidelines on how to submit.
