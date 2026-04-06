# Template: Gap Report

**File:** `templates/gap-report.md`

The gap report is a diagnostic evaluation of a domain specification against four gap categories. Each gap report is an immutable snapshot -- it records what was found at that point in time.

## Structure

### 1. Metadata Header

```markdown
> **Source Specification**: Domain Specification — [Domain Name] (Pass N)
> **Source Input**: [PRD, requirements doc, process description, etc.]
> **Pass**: [1, 2, 3, ...]
> **Date**: [YYYY-MM-DD]
```

### 2. Summary Table

| Category | Count | Errors | Warnings |
|----------|-------|--------|----------|
| Structural Gaps (SG) | | | |
| Heuristic Gaps (HG) | | | |
| Language Gaps (LG) | | | |
| Decision Gaps (DG) | | | |
| **Total** | | | |

### 3. Gap Entries by Category

Each gap category has its own section with individual gap entries.

#### Structural Gap Entry

```markdown
### SG-[NN]: [Short Description]

**Severity**: Error | Warning
**Rule**: [The structural principle being violated]
**Specification element**: [Which element in the spec has the gap]
**Analysis**: [What was measured, why it's a gap, consequence if unresolved]
**Recommendation**: [What to change, or what question the architect must answer]
```

#### Heuristic Gap Entry

```markdown
### HG-[NN]: [Short Description]

**Severity**: Warning
**Rule**: [The DDD heuristic being violated]
**Source**: [Evans | Vernon | Brandolini | NDK — cite the principle]
**Metric**: [What was measured]
**Threshold**: [The default threshold and its source]
**Current value**: [What the specification actually shows]
**Analysis**: [Why this matters]
**Recommendation**: [Change the model, or override with documented rationale]
```

#### Language Gap Entry

```markdown
### LG-[NN]: [Short Description]

**Severity**: Error | Warning
**Location**: [Which contexts or elements are affected]
**Analysis**: [The ambiguity or inconsistency identified]
**Recommendation**: [Rename, add explicit homonym declaration, or define the term]
```

#### Decision Gap Entry

```markdown
### DG-[NN]: [Short Description]

**Severity**: Warning
**Location**: [Which architectural decision is missing or undocumented]
**Analysis**: [Why this decision matters and what happens if left implicit]
**Options**: [List the viable alternatives]
**Recommendation**: [Which option to evaluate first and why]
```

### 4. Gap Resolution Priorities

| Priority | Gap IDs | Rationale |
|----------|---------|-----------|
| Must resolve this pass | | Structural integrity, foundational boundaries |
| Should resolve this pass | | Heuristic alignment, semantic clarity |
| Can defer to next pass | | Optimization, projection design |

### 5. Convergence Status

| Pass | Gaps | Errors | Warnings | Resolved |
|------|------|--------|----------|----------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

## Running a Gap Report

### Step 1: Evaluate Structural Gaps

- Does every aggregate have at least one invariant?
- Does every command have a corresponding domain event?
- Are all cross-context dependencies declared with relationship types?
- Are all referenced building blocks fully defined?

### Step 2: Evaluate Heuristic Gaps

- Is aggregate command density within threshold (6 or fewer)?
- Are there sagas where multi-step cross-aggregate processes exist?
- Is context term overlap within threshold (3 or fewer shared terms)?
- Are policies single-reaction (1 event in, 1 command out)?

### Step 3: Evaluate Language Gaps

- Does every term have exactly one meaning within its context?
- Are cross-context terms declared as homonyms or shared kernel?
- Are all terms used in commands/events defined in the glossary?

### Step 4: Evaluate Decision Gaps

- Does every boundary placement have documented rationale?
- Are all aggregate decomposition tradeoffs documented?
- Are deferred decisions explicitly scoped (e.g., "V2")?

### Step 5: Prioritize

Classify each gap into must/should/can-defer for this pass.

## Gap ID Conventions

- `SG-01`, `SG-02` -- sequential within a single pass
- `HG-P2-01` -- when tracking across passes, include pass prefix
- Severity is always `ERROR` or `WARNING` -- no other levels
