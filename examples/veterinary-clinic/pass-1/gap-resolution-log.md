# Gap Resolution Log — Greenfield Veterinary Clinic (Pass 1)

> **Source**: Gap Report — Greenfield Veterinary Clinic (Pass 1)
> **Date**: 2026-03-20
> **Decision authority**: [Architect]
> **Resolved**: 18/18 (16 accepted, 2 accepted with modification)

---

## Resolution Summary

| Category | Total | Accepted | Accepted w/ Modification | Rejected |
|----------|-------|----------|--------------------------|----------|
| Structural Gaps | 7 | 5 | 2 | 0 |
| Heuristic Gaps | 5 | 5 | 0 | 0 |
| Language Gaps | 2 | 2 | 0 | 0 |
| Decision Gaps | 4 | 4 | 0 | 0 |
| **Total** | **18** | **16** | **2** | **0** |

---

## Resolutions

### SG-01: Appointment aggregate has zero invariants — ACCEPTED

**Resolution**: Add three invariants. `INV-AP-01`: No two appointments for the same veterinarian may overlap in scheduled time window. `INV-AP-02`: Appointment status must follow lifecycle — booked → {checked-in, cancelled}; checked-in → visited. `INV-AP-03`: Rescheduled time must be in the future relative to command timestamp.

**Structural impact**: +3 invariants on Appointment aggregate.

### SG-02: Visit aggregate has zero invariants — ACCEPTED

**Resolution**: Add three invariants. `INV-VS-01`: A visit can only be opened for an appointment with status checked-in. `INV-VS-02`: Only one active (open) visit per appointment. `INV-VS-03`: A visit cannot be closed if it has zero associated clinical episodes.

**Structural impact**: +3 invariants on Visit aggregate.

### SG-03: Treatment aggregate command sequence not enforced — ACCEPTED W/ MODIFICATION

**Resolution**: Accept recommendation to define explicit state machine, but combine with LG-02 resolution — rename Treatment to ClinicalEpisode first. State machine: `initiated → diagnosed → treating → completed`. `RecordDiagnosis` only valid in `initiated`. `AdministerMedication` only valid in `diagnosed` or `treating`. `CompleteTreatment` only valid in `diagnosed` or `treating`.

**Structural impact**: Aggregate renamed to ClinicalEpisode. +1 value object (EpisodeStatus enum). State machine documented.

### SG-04: Billing context has no declared relationship to Clinical Care — ACCEPTED

**Resolution**: Declare Customer-Supplier. Clinical Care is upstream supplier, Billing is downstream customer. Clinical Care owns event schemas (`VisitClosed`, `TreatmentCompleted`). Billing conforms to those schemas. Add to context relationship declarations.

**Structural impact**: +1 explicit context relationship.

### SG-05: No event for emergency/walk-in visits — ACCEPTED W/ MODIFICATION

**Resolution**: Accept option A with modification. Add `AcceptWalkIn` command to Scheduling that creates an appointment with type `walk-in` and immediately emits both `AppointmentBooked` (with visitType: walk-in) and `PatientCheckedIn`. This preserves the Scheduling → Clinical Care contract. The downstream policy `OpenVisitOnCheckIn` works for both scheduled and walk-in paths.

**Structural impact**: +1 command on Appointment, +1 visitType value (walk-in).

### SG-06: PatientHistoryView crosses context boundary — ACCEPTED

**Resolution**: Move PatientHistoryView from Patient Records to Clinical Care. Clinical Care already consumes the events it needs. Patient Records owns animal identity; Clinical Care owns clinical history. Rename to ClinicalHistoryView for clarity.

**Structural impact**: -1 projection in Patient Records, +1 projection in Clinical Care (ClinicalHistoryView).

### SG-07: NotifyOwnerOnAppointmentBooked is infrastructure — ACCEPTED

**Resolution**: Remove from domain specification. Notification is an infrastructure concern handled by a listener on `AppointmentBooked`. Not a domain policy.

**Structural impact**: -1 policy in Scheduling.

### HG-01: Treatment aggregate is a pipeline, not independent commands — ACCEPTED

**Resolution**: Evaluate in conjunction with HG-04 (zero sagas). The ClinicalEpisode (formerly Treatment) has sequential dependencies that suggest saga behavior, but within a single aggregate the state machine (SG-03 resolution) adequately enforces the sequence. The cross-aggregate lifecycle (appointment → visit → episodes → invoice) is the saga candidate, not the episode itself. Defer saga decision to HG-04.

**Structural impact**: None beyond SG-03 resolution.

### HG-02: AnimalProfile and Owner separation — ACCEPTED

**Resolution**: Keep separated. Owner lifecycle is independent — owners change contact information, add/remove animals, exist before any animal is registered. Animal profiles have independent medical histories. They share an invariant but have distinct lifecycles. Separation is correct.

**Structural impact**: No change. Documented as intentional.

### HG-03: Context term overlap with "Patient" — ACCEPTED

**Resolution**: Add explicit definitions per context. Scheduling: "Patient" means the animal identified in an appointment. Patient Records: "Patient" means the animal's persistent identity and history. Clinical Care: "Patient" means the animal currently under active care. No renaming needed — the glossary definitions make the semantic boundaries explicit.

**Structural impact**: +3 glossary entries.

### HG-04: Zero sagas — visit lifecycle needs compensation — ACCEPTED

**Resolution**: Introduce VisitLifecycleSaga in Clinical Care. Trigger: `PatientCheckedIn`. Steps: (1) Open visit, (2) Await clinical episodes, (3) Close visit on veterinarian command, (4) Emit `VisitClosed` for downstream invoice generation. Compensation: if visit is abandoned (patient leaves without treatment), saga transitions to `abandoned` state and emits `VisitAbandoned` — no invoice generated.

**Structural impact**: +1 saga (VisitLifecycleSaga), +1 event (VisitAbandoned), +1 saga state (abandoned).

### HG-05: Invoice aggregate — no payment lifecycle — ACCEPTED

**Resolution**: Define invoice states: `generated → partially-paid → paid → disputed → refunded`. Add invariant: `INV-IN-02`: Payment amount cannot exceed remaining balance. Add `DisputeInvoice` and `RefundInvoice` commands for V1 completeness.

**Structural impact**: +1 value object (InvoiceStatus enum), +2 commands, +2 events, +1 invariant on Invoice.

### LG-01: "Visit" vs. "Appointment" semantic overlap — ACCEPTED

**Resolution**: Add explicit glossary definitions. "An appointment is a time commitment — a scheduled slot. A visit is a clinical encounter — the medical work performed. An appointment may precede a visit. A visit does not require an appointment (walk-ins). The boundary is check-in: the patient transitions from the scheduling domain to the clinical domain."

**Structural impact**: +2 glossary entries (updated definitions).

### LG-02: "Treatment" is overloaded — ACCEPTED

**Resolution**: Rename Treatment aggregate to ClinicalEpisode. Reserve "treatment" for individual interventions (medications, procedures). A clinical episode contains one or more treatments. Combined with SG-03 resolution.

**Structural impact**: Aggregate renamed (already counted in SG-03).

### DG-01: Who owns the veterinarian schedule? — ACCEPTED

**Resolution**: Add Veterinarian aggregate to Scheduling context (not a new bounded context — veterinarian scheduling is a scheduling concern, not a staff management concern). Commands: `SetAvailability`, `BlockTimeSlot`. Events: `AvailabilitySet`, `TimeSlotBlocked`. Invariant: veterinarian must have at least one availability window defined before appointments can be booked.

**Structural impact**: +1 aggregate, +2 commands, +2 events, +1 invariant in Scheduling.

### DG-02: How does pricing work? — ACCEPTED

**Resolution**: Add PriceList aggregate to Billing context. Static pricing for V1: treatment code → price. Commands: `SetPrice`, `DeactivatePrice`. Events: `PriceSet`, `PriceDeactivated`. Invariant: every treatment code referenced in an invoice must have an active price at time of invoice generation. Dynamic pricing deferred to V2.

**Structural impact**: +1 aggregate, +2 commands, +2 events, +1 invariant in Billing.

### DG-03: Medical history source of truth — ACCEPTED

**Resolution**: Patient Records owns the persistent medical record. Clinical Care reads a snapshot at visit start via the ClinicalHistoryView (moved from Patient Records in SG-06). At visit close, Clinical Care emits events that Patient Records consumes to update the persistent record. Relationship: Partnership (bidirectional data flow, both contexts benefit).

**Structural impact**: +1 context relationship (Partnership between Patient Records and Clinical Care).

### DG-04: Multi-animal scenarios — ACCEPTED

**Resolution**: Documented as V1 scope decision: "Each animal is treated as an independent patient. Appointments are per-animal. Invoices are per-visit (one animal per visit). Multi-pet billing, combined appointments, and sibling discounts are deferred to V2." Added as Design Principle #1.

**Structural impact**: +1 design principle.

---

## Deviations from Recommendation

| Gap ID | Recommendation | Actual Decision | Rationale |
|--------|---------------|-----------------|-----------|
| SG-03 | Define state machine | Combined with LG-02 rename | Renaming first prevented double-work |
| SG-05 | Option A (AcceptWalkIn) | Option A with immediate dual-emit | Single command emitting two events avoids two-step walk-in process |

---

## Follow-ups Identified

| Item | Source Gap | Description | Target |
|------|-----------|-------------|--------|
| Dynamic pricing model | DG-02 | V2 pricing: veterinarian + time + code | Backlog |
| Multi-pet scheduling | DG-04 | Combined appointments for sibling animals | V2 backlog |
| VisitLifecycleSaga timeout | HG-04 | How long can a saga stay in "open" before auto-abandoning? | Pass 2 |
