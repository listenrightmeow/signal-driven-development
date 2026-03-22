# Gap Report — Greenfield Veterinary Clinic (Pass 2)

> **Source Specification**: Domain Specification — Greenfield Veterinary Clinic (Pass 2)
> **Pass**: 2
> **Date**: 2026-03-20

---

## Summary

| Category | Count | Errors | Warnings |
|----------|-------|--------|----------|
| Structural Gaps (SG) | 2 | 0 | 2 |
| Heuristic Gaps (HG) | 1 | 0 | 1 |
| Language Gaps (LG) | 0 | 0 | 0 |
| Decision Gaps (DG) | 2 | 0 | 2 |
| **Total** | **5** | **0** | **5** |

---

## Structural Gaps

### SG-P2-01: VisitLifecycleSaga has no timeout for open state

**Severity**: Warning
**Rule**: Sagas with unbounded wait states create lifecycle debt.
**Analysis**: The VisitLifecycleSaga introduced in Pass 1 (HG-04 resolution) transitions to "open" when a visit begins but has no defined timeout. If a veterinarian forgets to close a visit, the saga waits indefinitely. Flagged as a follow-up in Pass 1.
**Recommendation**: Add a configurable timeout (default: 12 hours). When timeout elapses, emit `VisitTimeoutWarning` event. After a second threshold (24 hours), auto-transition to `abandoned`.

### SG-P2-02: Walk-in path dual-emit creates event ordering dependency

**Severity**: Warning
**Rule**: Commands that emit multiple events must define ordering guarantees.
**Analysis**: `AcceptWalkIn` (SG-05 resolution) emits both `AppointmentBooked` and `PatientCheckedIn`. The downstream policy `OpenVisitOnCheckIn` triggers on `PatientCheckedIn`. If `PatientCheckedIn` is processed before `AppointmentBooked`, the visit references an appointment that doesn't exist yet in projections.
**Recommendation**: Define ordering: `AppointmentBooked` must be persisted before `PatientCheckedIn` is emitted. Both events carry the same `appointmentId` for correlation. Document as a domain invariant on the walk-in path.

---

## Heuristic Gaps

### HG-P2-01: Scheduling context now has 3 aggregates — at heuristic boundary

**Severity**: Warning
**Rule**: Context size heuristic — ≤ 3 aggregates per context preferred
**Metric**: 3 aggregates (Appointment, Veterinarian, ScheduleAvailability implied)
**Analysis**: Adding the Veterinarian aggregate (DG-01 resolution) puts Scheduling at the heuristic boundary. ScheduleAvailabilityService queries both Appointment and Veterinarian state. The service may be doing the work of a third aggregate. Currently acceptable — monitor in Pass 3.
**Recommendation**: Accept for now. If V2 adds more scheduling complexity (room management, equipment booking), split into Scheduling and Staff Availability contexts.

---

## Decision Gaps

### DG-P2-01: ClinicalEpisode — can multiple episodes exist per visit?

**Severity**: Warning
**Analysis**: A visit may involve multiple clinical episodes (exam, then X-ray, then treatment). The specification doesn't explicitly state whether a visit has exactly one or one-to-many episodes. The VisitLifecycleSaga "awaits clinical episodes" (plural) but no invariant defines the cardinality.
**Recommendation**: Define explicitly. Proposed: a visit may have one or more clinical episodes. The saga completes when the veterinarian issues `CloseVisit`, regardless of episode count. Add invariant on Visit: at least one episode must reach `completed` status before visit can be closed.

### DG-P2-02: PriceList — who can change prices and when?

**Severity**: Warning
**Analysis**: PriceList aggregate (DG-02 resolution) has `SetPrice` and `DeactivatePrice` commands, but no access control or temporal constraint. Can prices change while an active visit is in progress? If a price changes between `TreatmentCompleted` and `GenerateInvoice`, which price applies?
**Recommendation**: Define pricing snapshot rule: invoice generation captures prices at the moment `VisitClosed` is emitted. Price changes after visit closure do not affect invoices for that visit. Add invariant on Invoice: line item prices are immutable after invoice generation.

---

## Convergence Status

| Pass | Gaps | Errors | Warnings | Resolved |
|------|------|--------|----------|----------|
| 1 | 18 | 5 | 13 | 18/18 |
| 2 | 5 | 0 | 5 | — |
