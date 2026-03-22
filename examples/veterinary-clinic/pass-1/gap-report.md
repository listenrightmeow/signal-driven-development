# Gap Report — Greenfield Veterinary Clinic (Pass 1)

> **Source Specification**: Domain Specification — Greenfield Veterinary Clinic (Pass 1)
> **Source Input**: Product requirements document (fictional)
> **Pass**: 1
> **Date**: 2026-03-20

---

## Summary

| Category | Count | Errors | Warnings |
|----------|-------|--------|----------|
| Structural Gaps (SG) | 7 | 3 | 4 |
| Heuristic Gaps (HG) | 5 | 0 | 5 |
| Language Gaps (LG) | 2 | 0 | 2 |
| Decision Gaps (DG) | 4 | 2 | 2 |
| **Total** | **18** | **5** | **13** |

---

## Structural Gaps

### SG-01: Appointment aggregate has zero invariants (ERROR)

**Rule**: Aggregates must protect at least one invariant — an aggregate without invariants has no consistency boundary to enforce.
**Specification element**: Appointment aggregate in Scheduling context
**Analysis**: Appointment defines four commands and four events but no invariants. What prevents double-booking the same time slot? What prevents checking in a cancelled appointment? What prevents rescheduling to a time in the past? Without invariants, the Appointment aggregate is a data container, not a consistency boundary.
**Recommendation**: Define invariants. At minimum: (1) No two appointments for the same veterinarian may overlap in time. (2) Appointment status must follow a valid lifecycle: booked → checked-in → visited; booked → cancelled. (3) Rescheduled time must be in the future.

### SG-02: Visit aggregate has zero invariants (ERROR)

**Rule**: Aggregates must protect at least one invariant.
**Specification element**: Visit aggregate in Clinical Care context
**Analysis**: Visit has two commands (OpenVisit, CloseVisit) and no invariants. What prevents closing a visit that was never opened? What prevents opening multiple visits for the same appointment? A visit without invariants is a pair of timestamps, not a domain concept.
**Recommendation**: Define invariants. At minimum: (1) A visit can only be opened for an appointment in checked-in status. (2) Only one active visit per appointment. (3) A visit cannot be closed with zero treatments recorded.

### SG-03: Treatment aggregate command sequence not enforced (ERROR)

**Rule**: Command preconditions must enforce the aggregate's expected lifecycle.
**Specification element**: Treatment aggregate in Clinical Care context
**Analysis**: `INV-TR-02` says medication can only be administered after diagnosis, but there's no explicit state machine. Can `CompleteTreatment` be called before `RecordDiagnosis`? Can `StartTreatment` be called twice? The invariants describe constraints but the lifecycle transitions are implicit.
**Recommendation**: Define an explicit state machine: `started → diagnosed → treating → completed`. Each command is valid only in specific states. Document the transitions.

### SG-04: Billing context has no declared relationship to Clinical Care

**Severity**: Warning
**Rule**: All cross-context dependencies must be explicitly declared with relationship type.
**Specification element**: Billing bounded context
**Analysis**: The `GenerateInvoiceOnVisitClosed` policy in Billing triggers on `VisitClosed` (a Clinical Care event). But the Billing context description says "Upstream dependencies: Clinical Care (treatment costs)" without specifying the relationship type. Is this Customer-Supplier? Conformist? Published Language? The relationship type determines who controls the contract.
**Recommendation**: Declare as Customer-Supplier (Clinical Care is upstream supplier, Billing is downstream customer). Clinical Care owns the event schema; Billing conforms.

### SG-05: No event for emergency/walk-in visits — only scheduled path exists

**Severity**: Warning
**Rule**: Domain specification must cover all entry paths described in requirements.
**Specification element**: Scheduling and Clinical Care contexts
**Analysis**: The requirements mention "scheduled or emergency visits." The specification only models the scheduled path (appointment → check-in → visit). There's no path for an animal arriving without an appointment. How does a walk-in become a visit?
**Recommendation**: Either (A) add an `AcceptWalkIn` command that creates both an appointment and triggers check-in, or (B) allow `OpenVisit` without a preceding appointment. Option B breaks the Scheduling → Clinical Care contract. Option A preserves it.

### SG-06: PatientHistoryView consumes events from Clinical Care but lives in Patient Records

**Severity**: Warning
**Rule**: Projections should consume events from their own context or from explicitly declared upstream contexts.
**Specification element**: PatientHistoryView projection in Patient Records context
**Analysis**: This projection consumes `DiagnosisRecorded`, `TreatmentCompleted`, and `MedicationAdministered` — all Clinical Care events. But Patient Records doesn't declare Clinical Care as an upstream dependency. The projection is crossing a context boundary without a declared relationship.
**Recommendation**: Either (A) move PatientHistoryView to Clinical Care, or (B) declare a relationship from Patient Records to Clinical Care. Option B is unusual — Patient Records is upstream of Clinical Care elsewhere. Consider whether this projection actually belongs in a new "Reporting" context or a shared read model.

### SG-07: NotifyOwnerOnAppointmentBooked is infrastructure, not a domain policy

**Severity**: Warning
**Rule**: Policies model domain reactions. Infrastructure concerns (notifications, emails) are not domain policies.
**Specification element**: NotifyOwnerOnAppointmentBooked policy in Scheduling context
**Analysis**: Sending a notification isn't a domain behavior — it's an infrastructure side effect. Modeling it as a policy inflates the domain model with non-domain concerns. The notification doesn't change domain state or issue domain commands.
**Recommendation**: Remove from domain specification. Handle as an infrastructure listener on `AppointmentBooked`. If the business rule is "owners must be notified," model the confirmation requirement as an invariant or a process step, not a policy.

---

## Heuristic Gaps

### HG-01: Treatment aggregate command density — 4 commands with sequential dependencies

**Rule**: Aggregate command density ≤ 6 (Vernon)
**Metric**: 4 commands (within threshold)
**Analysis**: Although the count is within threshold, the commands have strict sequential dependencies (StartTreatment → RecordDiagnosis → AdministerMedication → CompleteTreatment). This is a pipeline, not independent commands on an aggregate. Sequential command chains that must execute in order suggest a saga or process manager, not an aggregate.
**Recommendation**: Evaluate whether Treatment should be a saga coordinating smaller aggregates (Diagnosis, Medication, etc.) rather than a single aggregate with a pipeline.

### HG-02: AnimalProfile and Owner as separate aggregates in same context — potential over-separation

**Rule**: Aggregates in the same context that always change together should be a single aggregate (Evans — aggregate consistency boundary)
**Metric**: 2 aggregates, 1 invariant connecting them (`INV-AP-01`: every animal associated with one owner)
**Analysis**: `RegisterAnimal` requires an ownerId. `RegisterOwner` must precede `RegisterAnimal`. Is there a scenario where an animal profile changes independently of the owner, or where the owner changes independently of the animal? If they always change together (registration is always owner + animal), they may be a single aggregate.
**Recommendation**: Keep separated if they have independent lifecycles (owner changes address without affecting animal records). If they're always modified together, consider merging into a single PatientRecord aggregate.

### HG-03: Context term overlap — "Patient" used across contexts without explicit definition

**Rule**: Context term overlap ≤ 3 shared terms (Evans — bounded contexts should have distinct models)
**Metric**: "Patient" appears in Scheduling (appointment for a patient), Patient Records (patient profile), and Clinical Care (treating a patient). Used with slightly different meanings in each.
**Analysis**: In Patient Records, "patient" means the animal's identity and history. In Clinical Care, "patient" means the animal being treated right now. In Scheduling, "patient" means the animal with an appointment. These are different projections of the same entity across three contexts — which is fine, but the differences aren't declared.
**Recommendation**: Define "patient" explicitly in each context's glossary. Consider whether Scheduling should use "appointment holder" and Clinical Care should use "patient under care" to make the semantic distinction visible.

### HG-04: Zero sagas in a domain with multi-step processes

**Rule**: Domains with cross-aggregate, multi-step processes typically require at least one saga.
**Metric**: 0 sagas, 3 policies
**Analysis**: The full visit lifecycle spans multiple aggregates across multiple contexts: Appointment → Visit → Treatment(s) → Invoice. This is a multi-step process with potential failure points (what if treatment is started but the visit is never closed? What if the visit is closed but invoice generation fails?). Policies handle the happy path. There's no compensation or failure handling.
**Recommendation**: Evaluate the visit lifecycle as a saga candidate: `PatientCheckedIn → VisitOpened → TreatmentCompleted → VisitClosed → InvoiceGenerated`. Define compensation for each step.

### HG-05: Invoice aggregate — no explicit handling of partial payments or disputes

**Rule**: Aggregate must model all stated business behaviors
**Metric**: 2 commands (GenerateInvoice, RecordPayment)
**Analysis**: `RecordPayment` mentions "full or partial payment" but there's no concept of payment state (unpaid, partially paid, paid, disputed, refunded). The aggregate has one invariant (total = sum of line items) but no lifecycle invariants.
**Recommendation**: Define Invoice states and the transitions between them. Add invariant: payment recorded cannot exceed remaining balance.

---

## Language Gaps

### LG-01: "Visit" vs. "Appointment" — semantic overlap

**Location**: Scheduling and Clinical Care contexts
**Analysis**: An appointment is a scheduled time. A visit is a clinical encounter. But `PatientCheckedIn` (Scheduling) triggers `OpenVisit` (Clinical Care) — the transition from appointment to visit is the moment the patient walks in. The specification doesn't clearly define where "appointment" ends and "visit" begins. Is check-in the boundary? What about emergency visits without appointments?
**Recommendation**: Define explicitly: "An appointment is a time commitment. A visit is a clinical encounter. An appointment *may* precede a visit. A visit does not require an appointment." Add to glossary.

### LG-02: "Treatment" is overloaded

**Location**: Clinical Care context
**Analysis**: "Treatment" in the aggregate means the full clinical encounter (diagnosis + medications + procedures). But in common veterinary language, a "treatment" is a single intervention (administer medication, perform surgery). The aggregate is actually a "clinical episode" containing multiple treatments. This overloading will cause confusion in the ubiquitous language.
**Recommendation**: Rename the aggregate to `ClinicalEpisode` or `VisitTreatmentPlan`. Reserve "treatment" for individual interventions.

---

## Decision Gaps

### DG-01: Who owns the veterinarian schedule? (ERROR)

**Location**: Scheduling context, ScheduleAvailabilityService
**Analysis**: `ScheduleAvailabilityService` checks veterinarian availability, but there's no Veterinarian aggregate or schedule model anywhere in the specification. Where does veterinarian identity live? Who manages their availability, working hours, and specializations? This is a missing bounded context or a missing aggregate.
**Recommendation**: Either (A) add a Veterinarian aggregate to Scheduling with schedule management commands, or (B) introduce a "Staff Management" bounded context. The choice depends on whether veterinarian management is a core domain concern or a supporting subdomain.

### DG-02: How does pricing work? (ERROR)

**Location**: Billing context, PricingService
**Analysis**: `PricingService` "calculates line item prices based on treatment codes and clinic pricing rules." But there's no pricing model, no price list aggregate, no pricing configuration. Where do prices come from? Are they per-treatment-code? Per-veterinarian? Time-based? The service exists but its data model is undefined.
**Recommendation**: Define a PriceList aggregate in Billing with pricing rules. Determine whether pricing is static (code → price) or dynamic (code + veterinarian + time → price).

### DG-03: Medical history — who is the source of truth?

**Severity**: Warning
**Location**: Patient Records and Clinical Care contexts
**Analysis**: PatientHistoryView in Patient Records consumes Clinical Care events. But Clinical Care also needs medical history to inform treatment decisions (allergies, prior diagnoses). Who owns the canonical medical history? Is it Patient Records (the long-term record) or Clinical Care (the active clinical view)?
**Recommendation**: Patient Records owns the historical record. Clinical Care reads from it at visit start and writes back at visit close. Define the relationship explicitly as Customer-Supplier with Patient Records as supplier.

### DG-04: What happens when an owner has multiple animals?

**Severity**: Warning
**Location**: Patient Records context
**Analysis**: The model supports multiple animals per owner (`INV-AP-01`: every animal associated with one owner). But there's no handling of common multi-pet scenarios: sibling discount? Combined appointments? Single invoice for multiple animals seen in one visit? These may be out of scope for V1, but the decision should be documented.
**Recommendation**: Document as V1 scope decision: "Each animal is treated as an independent patient. Multi-pet billing and scheduling are deferred to V2." This prevents implicit assumptions during implementation.

---

## Gap Resolution Priorities

| Priority | Gap IDs | Rationale |
|----------|---------|-----------|
| Must resolve this pass | SG-01, SG-02, SG-03, DG-01, DG-02 | Structural integrity — aggregates without invariants, missing domain concepts |
| Should resolve this pass | SG-04, SG-05, SG-06, HG-01, HG-04, LG-01, LG-02 | Boundary decisions, semantic clarity, lifecycle modeling |
| Can defer to next pass | SG-07, HG-02, HG-03, HG-05, DG-03, DG-04, LG-01 | Refinement, naming, scope decisions |

---

## Convergence Status

| Pass | Gaps | Errors | Warnings | Resolved |
|------|------|--------|----------|----------|
| 1 | 18 | 5 | 13 | — |
