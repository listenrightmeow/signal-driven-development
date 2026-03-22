# Gap Report — [Domain Name] (Pass N)

> **Source Specification**: Domain Specification — [Domain Name] (Pass N)
> **Source Input**: [PRD, requirements doc, process description, etc.]
> **Pass**: [1, 2, 3, ...]
> **Date**: [YYYY-MM-DD]

---

## Summary

| Category | Count | Errors | Warnings |
|----------|-------|--------|----------|
| Structural Gaps (SG) | | | |
| Heuristic Gaps (HG) | | | |
| Language Gaps (LG) | | | |
| Decision Gaps (DG) | | | |
| **Total** | | | |

---

## Structural Gaps

### SG-[NN]: [Short Description]

**Severity**: Error | Warning
**Rule**: [The structural principle being violated]
**Specification element**: [Which element in the spec has the gap]
**Analysis**: [What was measured, why it's a gap, what the consequence is if unresolved]
**Recommendation**: [What to change, or what question the architect must answer]

---

## Heuristic Gaps

### HG-[NN]: [Short Description]

**Severity**: Warning
**Rule**: [The DDD heuristic being violated]
**Source**: [Evans | Vernon | Brandolini | NDK — cite the principle]
**Metric**: [What was measured]
**Threshold**: [The default threshold and its source]
**Current value**: [What the specification actually shows]
**Analysis**: [Why this matters — what happens when this threshold is exceeded]
**Recommendation**: [Change the model, or override the threshold with documented rationale]

---

## Language Gaps

### LG-[NN]: [Short Description]

**Severity**: Error | Warning
**Location**: [Which contexts or elements are affected]
**Analysis**: [The ambiguity or inconsistency identified]
**Recommendation**: [Rename, add explicit homonym declaration, or define the term]

---

## Decision Gaps

### DG-[NN]: [Short Description]

**Severity**: Warning
**Location**: [Which architectural decision is missing or undocumented]
**Analysis**: [Why this decision matters and what happens if it's left implicit]
**Options**: [List the viable alternatives]
**Recommendation**: [Which option to evaluate first and why]

---

## Gap Resolution Priorities

| Priority | Gap IDs | Rationale |
|----------|---------|-----------|
| Must resolve this pass | | Structural integrity, foundational boundaries |
| Should resolve this pass | | Heuristic alignment, semantic clarity |
| Can defer to next pass | | Optimization, projection design |

---

## Convergence Status

| Pass | Gaps | Errors | Warnings | Resolved |
|------|------|--------|----------|----------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Convergence invariant**: Gap count must decrease across passes. If Pass N+1 identifies more gaps than Pass N resolved, the specification is diverging.
