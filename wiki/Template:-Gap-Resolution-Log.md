# Template: Gap Resolution Log

**File:** `templates/gap-resolution-log.md`

The gap resolution log documents how each gap was resolved. It captures the rationale behind every architectural decision -- the value of a resolution is in the reasoning, not just the outcome. Each log is an immutable snapshot.

## Structure

### 1. Metadata Header

```markdown
> **Source**: Gap Report — [Domain Name] (Pass N)
> **Date**: [YYYY-MM-DD]
> **Decision authority**: [Name of architect making the decisions]
> **Resolved**: [X/Y] ([Z accepted, W rejected])
```

### 2. Resolution Summary

| Category | Total | Accepted | Accepted w/ Modification | Rejected |
|----------|-------|----------|--------------------------|----------|
| Structural Gaps | | | | |
| Heuristic Gaps | | | | |
| Language Gaps | | | | |
| Decision Gaps | | | | |
| **Total** | | | | |

### 3. Individual Resolutions

```markdown
### [GAP-ID]: [Short Description] — [ACCEPTED | ACCEPTED W/ MODIFICATION | REJECTED]

**Resolution**: [What was decided and why. Include the reasoning.]

**Structural impact**: [What changed in the domain specification.]
```

Examples of structural impact:
- `+1 invariant on Appointment aggregate`
- `Aggregate dissolved — demoted to domain service`
- `New saga introduced: VisitLifecycleSaga`
- `No change — documented as intentional override`

### 4. Deviations from Recommendation

| Gap ID | Recommendation | Actual Decision | Rationale for Deviation |
|--------|---------------|-----------------|------------------------|
| | | | |

This table captures cases where the architect diverged from the gap report's recommendation. These are not failures -- they are documented architectural decisions.

### 5. Follow-ups Identified

| Item | Source Gap | Description | Target |
|------|-----------|-------------|--------|
| | | | [Next pass \| ADR \| Backlog] |

Follow-ups are items discovered during resolution that don't belong in this pass but should be tracked.

## Resolution Outcomes

### Accept

The gap recommendation is adopted. The domain specification is changed accordingly.

**When to accept:**
- The gap identifies a genuine structural deficiency
- The recommendation aligns with domain understanding
- The fix is straightforward and doesn't introduce new complexity

### Accept with Modification

The recommendation is correct in principle but needs adjustment in execution.

**When to modify:**
- The gap is real but the suggested fix doesn't quite fit the domain
- A simpler change achieves the same goal
- The recommendation needs to account for constraints not visible in the specification

### Reject

The current design is intentional. The rationale for rejection is documented.

**When to reject:**
- The gap flags a pattern that is intentional in this domain
- The heuristic threshold doesn't apply to this specific context
- The cost of change outweighs the benefit, with documented reasoning

**Important:** Rejecting a gap is a valid architectural decision. The value is in the documented rationale, not in achieving 100% acceptance rate.

## Writing Good Rationale

The rationale is the most important part of a resolution. Future-you (or a teammate) will need to understand *why* a decision was made, not just *what* was decided.

Good rationale:
- "Treatment was decomposed into a saga because the multi-step process spans two aggregates and requires compensation on failure"
- "Rejected: the 4-aggregate context is intentional because all four aggregates participate in a single transaction boundary"

Bad rationale:
- "Fixed"
- "Accepted the recommendation"
- "It seemed right"
