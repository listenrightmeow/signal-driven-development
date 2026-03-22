# Gap Resolution Log — Greenfield Veterinary Clinic (Pass 2)

> **Source**: Gap Report — Greenfield Veterinary Clinic (Pass 2)
> **Date**: 2026-03-20
> **Decision authority**: [Architect]
> **Resolved**: 5/5 (5 accepted, 0 rejected)

---

## Resolution Summary

| Category | Total | Accepted | Rejected |
|----------|-------|----------|----------|
| Structural Gaps | 2 | 2 | 0 |
| Heuristic Gaps | 1 | 1 | 0 |
| Decision Gaps | 2 | 2 | 0 |
| **Total** | **5** | **5** | **0** |

---

## Resolutions

### SG-P2-01: VisitLifecycleSaga timeout — ACCEPTED

**Resolution**: Add configurable timeout. Default warning at 12 hours, auto-abandon at 24 hours. Emit `VisitTimeoutWarning` at 12h (informational — consumed by notification infrastructure, not a domain policy). Transition to `abandoned` at 24h, emitting `VisitAbandoned`. Timeout thresholds are configurable per clinic. Add `INV-SAGA-01`: "A visit in open state must transition to completed or abandoned within the configured timeout window."

**Structural impact**: +1 invariant on VisitLifecycleSaga, +1 event (VisitTimeoutWarning), timeout configuration added to saga.

### SG-P2-02: Walk-in dual-emit ordering — ACCEPTED

**Resolution**: Define ordering invariant: `INV-AP-04`: "For walk-in appointments, `AppointmentBooked` must be persisted and acknowledged before `PatientCheckedIn` is emitted. Both events share the same `appointmentId` for causal correlation." The command handler ensures sequential emission. Document in the walk-in path specification.

**Structural impact**: +1 invariant on Appointment (walk-in path).

### HG-P2-01: Scheduling context at 3-aggregate boundary — ACCEPTED

**Resolution**: Accept current structure. 3 aggregates is at threshold, not exceeding it. ScheduleAvailabilityService remains a domain service, not an aggregate — it queries state but doesn't own a consistency boundary. Document as V2 watch item: if scheduling grows (room management, equipment), reassess the context boundary.

**Structural impact**: No change. Documented as intentional with V2 trigger condition.

### DG-P2-01: Multiple episodes per visit — ACCEPTED

**Resolution**: Explicitly one-to-many. A visit may have one or more clinical episodes. `INV-VS-04`: "A visit cannot be closed unless at least one associated clinical episode has reached `completed` status." The VisitLifecycleSaga monitors episode completion events and allows `CloseVisit` only when this invariant is satisfiable.

**Structural impact**: +1 invariant on Visit.

### DG-P2-02: Pricing snapshot rule — ACCEPTED

**Resolution**: Invoice captures prices at moment of generation (triggered by `VisitClosed`). PriceList changes after that moment do not affect existing invoices. `INV-IN-03`: "Line item prices are immutable after invoice generation. The price applied is the active price at `InvoiceGenerated` event timestamp." This is the standard point-in-time pricing pattern.

**Structural impact**: +1 invariant on Invoice.

---

## Deviations from Recommendation

None.

---

## Follow-ups Identified

| Item | Source Gap | Description | Target |
|------|-----------|-------------|--------|
| Context split trigger | HG-P2-01 | If Scheduling gains room/equipment booking, split context | V2 evaluation |
