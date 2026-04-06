# Severity Model

SDD uses a two-level severity model for gap classification. Severity determines resolution priority, not whether a gap should be investigated.

## Severity Levels

### ERROR

The specification has a structural deficiency that will cause ambiguity or failure during implementation. Must be resolved before the model is implementation-ready.

**Characteristics:**
- Binary -- the element is missing or malformed
- Blocks implementation if left unresolved
- Cannot be deferred to a later pass without risk

**Common ERROR gaps:**
- Aggregate with zero invariants (SG-01)
- Command with no corresponding domain event (SG-02)
- Missing domain concept referenced in requirements (DG-01)

### WARNING

The specification has a pattern that may cause problems or violates a known heuristic. Should be investigated and either resolved or documented as intentional.

**Characteristics:**
- May be a valid design choice in context
- Can sometimes be deferred to the next pass
- Requires investigation and documented rationale

**Common WARNING gaps:**
- Bounded context with no declared relationships (SG-03)
- Aggregate exceeding command density threshold (HG-01)
- Same term used with different definitions across contexts (LG-01)
- Boundary placement with undocumented tradeoffs (DG-03)

## Severity Distribution

In a typical Pass 1 gap report (15--35 gaps):

| Severity | Typical Count | Percentage |
|----------|---------------|------------|
| ERROR | 3--8 | ~25% |
| WARNING | 12--27 | ~75% |

ERRORs decrease rapidly across passes because they represent structural deficiencies that are straightforward to identify and resolve. WARNINGs persist longer because they often represent genuine architectural tradeoffs that require investigation.

## Resolution Requirements by Severity

| Severity | Must Resolve? | Can Defer? | Override Allowed? |
|----------|--------------|------------|-------------------|
| ERROR | Yes -- before model is implementation-ready | Only to the next immediate pass | No -- structural deficiencies must be fixed |
| WARNING | Should investigate | Yes -- with documented rationale | Yes -- document why the current design is intentional |

## Severity and Convergence

The convergence invariant applies to **total gap count** (errors + warnings combined). A model is converged when:

- Zero ERRORs remain
- Zero WARNINGs remain (or all remaining warnings are documented overrides)
- Total gap count has decreased across every pass
