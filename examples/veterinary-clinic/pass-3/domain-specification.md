# Domain Specification — Greenfield Veterinary Clinic (Pass 3 — Final)

> **Source Input**: Domain Specification Pass 2 + Gap Resolution Log Pass 2
> **Pass**: 3
> **Date**: 2026-03-20
> **Status**: Converged — zero unresolved gaps

---

## Bounded Contexts

### Scheduling

**Responsibility**: Manages appointment lifecycle — booking, rescheduling, cancellation, check-in, and walk-in acceptance. Manages veterinarian availability and schedule.
**Upstream dependencies**: Patient Records (needs patient identity)
**Downstream consumers**: Clinical Care (appointment triggers visit)
**Relationship type**: Customer-Supplier (Scheduling consumes Patient Records)
**Context size note**: 3 aggregates (at heuristic boundary). If V2 adds room or equipment booking, reassess context split.

### Patient Records

**Responsibility**: Maintains animal profiles, owner information, and the persistent medical record.
**Upstream dependencies**: None
**Downstream consumers**: Scheduling, Clinical Care, Billing
**Relationship type to Clinical Care**: Partnership (bidirectional — Patient Records supplies identity and history; Clinical Care writes back clinical outcomes)

### Clinical Care

**Responsibility**: Manages veterinary visits, clinical episodes (diagnoses, medications, procedures), and prescriptions. Owns the visit lifecycle saga.
**Upstream dependencies**: Scheduling (visit triggered by appointment), Patient Records (medical history via Partnership)
**Downstream consumers**: Billing
**Relationship type to Billing**: Customer-Supplier (Clinical Care is upstream supplier, Billing is downstream customer)

### Billing

**Responsibility**: Generates invoices, tracks payments, manages pricing. Invoices capture prices at point-in-time of visit closure.
**Upstream dependencies**: Clinical Care (visit closure triggers invoice generation)
**Downstream consumers**: None
**Relationship type**: Customer-Supplier (Billing conforms to Clinical Care event schemas)

---

## Building Block Inventory

| Building Block | Pass 1 | Pass 3 (Final) | Delta |
|----------------|--------|----------------|-------|
| Bounded Contexts | 4 | 4 | 0 |
| Aggregates | 6 | 8 | +2 (Veterinarian, PriceList) |
| Domain Services | 2 | 2 | 0 |
| Value Objects | 8 | 11 | +3 (EpisodeStatus, InvoiceStatus, visitType) |
| Commands | 14 | 21 | +7 |
| Domain Events | 12 | 19 | +7 |
| Policies | 3 | 2 | -1 (removed notification pseudo-policy) |
| Sagas | 0 | 1 | +1 (VisitLifecycleSaga) |
| Projections | 3 | 3 | 0 (1 moved, 1 renamed) |
| Invariants | 5 | 18 | +13 |
| Design Principles | 0 | 1 | +1 |

---

## Aggregates

### Appointment — Scheduling

**Identity**: `appointmentId` (UUID)
**Responsibility**: Manages the lifecycle of a scheduled or walk-in appointment.

**Commands**:
- `BookAppointment` — Schedules a new appointment. Preconditions: Time slot available, veterinarian has availability. Emits: `AppointmentBooked`.
- `RescheduleAppointment` — Moves to a new time. Preconditions: Appointment exists, not completed, new time is in the future. Emits: `AppointmentRescheduled`.
- `CancelAppointment` — Cancels the appointment. Preconditions: Appointment exists, not completed. Emits: `AppointmentCancelled`.
- `CheckInPatient` — Marks patient as arrived. Preconditions: Appointment exists, status is booked. Emits: `PatientCheckedIn`.
- `AcceptWalkIn` — Creates a walk-in appointment and immediately checks in. Preconditions: Veterinarian available. Emits: `AppointmentBooked` (visitType: walk-in) then `PatientCheckedIn`. Ordering invariant applies.

**Domain Events**:
- `AppointmentBooked` — Payload: appointmentId, patientId, veterinarianId, scheduledTime, visitType (scheduled | walk-in).
- `AppointmentRescheduled` — Payload: appointmentId, previousTime, newTime.
- `AppointmentCancelled` — Payload: appointmentId, reason.
- `PatientCheckedIn` — Payload: appointmentId, checkedInAt.

**Invariants**:
- `INV-AP-01`: No two appointments for the same veterinarian may overlap in scheduled time window.
- `INV-AP-02`: Appointment status must follow lifecycle — booked to checked-in or cancelled; checked-in to visited.
- `INV-AP-03`: Rescheduled time must be in the future relative to command timestamp.
- `INV-AP-04`: For walk-in appointments, `AppointmentBooked` must be persisted and acknowledged before `PatientCheckedIn` is emitted. Both events share the same `appointmentId` for causal correlation.

### Veterinarian — Scheduling

**Identity**: `veterinarianId` (UUID)
**Responsibility**: Manages veterinarian availability and schedule blocks.

**Commands**:
- `SetAvailability` — Defines recurring availability windows. Emits: `AvailabilitySet`.
- `BlockTimeSlot` — Blocks a specific time slot (vacation, meeting). Emits: `TimeSlotBlocked`.

**Domain Events**:
- `AvailabilitySet` — Payload: veterinarianId, dayOfWeek, startTime, endTime.
- `TimeSlotBlocked` — Payload: veterinarianId, blockedDate, startTime, endTime, reason.

**Invariants**:
- `INV-VET-01`: Veterinarian must have at least one availability window defined before appointments can be booked.

### AnimalProfile — Patient Records

**Identity**: `animalId` (UUID)
**Responsibility**: Maintains the animal's identity and medical history.

**Commands**:
- `RegisterAnimal` — Creates a new patient record. Emits: `AnimalRegistered`.
- `UpdateAnimalProfile` — Updates weight, allergies, notes. Emits: `AnimalProfileUpdated`.

**Domain Events**:
- `AnimalRegistered` — Payload: animalId, ownerId, species, breed, name, dateOfBirth.
- `AnimalProfileUpdated` — Payload: animalId, changedFields.

**Invariants**:
- `INV-AP-01`: Every animal must be associated with exactly one owner.

### Owner — Patient Records

**Identity**: `ownerId` (UUID)
**Responsibility**: Maintains owner contact information and links to animals.

**Commands**:
- `RegisterOwner` — Creates owner record. Emits: `OwnerRegistered`.
- `UpdateOwnerContact` — Updates phone, email, address. Emits: `OwnerContactUpdated`.

**Domain Events**:
- `OwnerRegistered` — Payload: ownerId, name, phone, email.
- `OwnerContactUpdated` — Payload: ownerId, changedFields.

**Invariants**:
- `INV-OW-01`: Owner must have at least one contact method (phone or email).

### Visit — Clinical Care

**Identity**: `visitId` (UUID)
**Responsibility**: Links an appointment to clinical activities. Managed by the VisitLifecycleSaga.

**Commands**:
- `OpenVisit` — Initiates a clinical visit from a checked-in appointment. Emits: `VisitOpened`.
- `CloseVisit` — Marks the visit as complete. Preconditions: at least one clinical episode completed. Emits: `VisitClosed`.

**Domain Events**:
- `VisitOpened` — Payload: visitId, appointmentId, animalId, veterinarianId.
- `VisitClosed` — Payload: visitId, closedAt.

**Invariants**:
- `INV-VS-01`: A visit can only be opened for an appointment with status checked-in.
- `INV-VS-02`: Only one active (open) visit per appointment.
- `INV-VS-03`: A visit cannot be closed if it has zero associated clinical episodes.
- `INV-VS-04`: A visit cannot be closed unless at least one associated clinical episode has reached `completed` status.

### ClinicalEpisode — Clinical Care

**Identity**: `episodeId` (UUID)
**Responsibility**: Manages a single clinical episode within a visit — from initiation through diagnosis and medication to completion. A visit may have one or more episodes.

**State machine**: `initiated` to `diagnosed` to `treating` to `completed`.

**Commands**:
- `StartEpisode` — Initiates a clinical episode for a visit. Valid in: (none — creates new). Emits: `EpisodeStarted`.
- `RecordDiagnosis` — Documents the veterinarian's diagnosis. Valid in: `initiated`. Emits: `DiagnosisRecorded`.
- `AdministerMedication` — Records a medication given. Valid in: `diagnosed` or `treating`. Emits: `MedicationAdministered`.
- `CompleteEpisode` — Marks episode as finished. Valid in: `diagnosed` or `treating`. Emits: `EpisodeCompleted`.

**Domain Events**:
- `EpisodeStarted` — Payload: episodeId, visitId, animalId, veterinarianId.
- `DiagnosisRecorded` — Payload: episodeId, diagnosisCode, notes.
- `MedicationAdministered` — Payload: episodeId, medicationId, dosage.
- `EpisodeCompleted` — Payload: episodeId, completedAt, summary.

**Value Objects**:
- `EpisodeStatus` — Enum: initiated, diagnosed, treating, completed.

**Invariants**:
- `INV-EP-01`: An episode cannot be completed without at least one diagnosis recorded.
- `INV-EP-02`: Medication can only be administered after diagnosis (status must be `diagnosed` or `treating`).

### Invoice — Billing

**Identity**: `invoiceId` (UUID)
**Responsibility**: Generates and tracks payment for a visit.

**State machine**: `generated` to `partially-paid` to `paid`; `generated` or `partially-paid` to `disputed`; `disputed` to `refunded`.

**Commands**:
- `GenerateInvoice` — Creates invoice from clinical episode line items. Prices captured at moment of generation. Emits: `InvoiceGenerated`.
- `RecordPayment` — Marks full or partial payment. Emits: `PaymentRecorded`.
- `DisputeInvoice` — Marks invoice as disputed. Emits: `InvoiceDisputed`.
- `RefundInvoice` — Processes refund for a disputed invoice. Emits: `InvoiceRefunded`.

**Domain Events**:
- `InvoiceGenerated` — Payload: invoiceId, visitId, lineItems, totalAmount.
- `PaymentRecorded` — Payload: invoiceId, amount, method, remainingBalance.
- `InvoiceDisputed` — Payload: invoiceId, reason.
- `InvoiceRefunded` — Payload: invoiceId, refundAmount.

**Value Objects**:
- `InvoiceStatus` — Enum: generated, partially-paid, paid, disputed, refunded.

**Invariants**:
- `INV-IN-01`: Invoice total must equal sum of line item amounts.
- `INV-IN-02`: Payment amount cannot exceed remaining balance.
- `INV-IN-03`: Line item prices are immutable after invoice generation. The price applied is the active price at `InvoiceGenerated` event timestamp.

### PriceList — Billing

**Identity**: `priceListId` (UUID)
**Responsibility**: Manages pricing rules for clinical episode codes. Static pricing for V1 (episode code maps to price). Dynamic pricing (code + veterinarian + time) deferred to V2.

**Commands**:
- `SetPrice` — Sets or updates the price for a treatment code. Emits: `PriceSet`.
- `DeactivatePrice` — Removes a treatment code from the active price list. Emits: `PriceDeactivated`.

**Domain Events**:
- `PriceSet` — Payload: priceListId, treatmentCode, price, effectiveDate.
- `PriceDeactivated` — Payload: priceListId, treatmentCode, deactivatedAt.

**Invariants**:
- `INV-PL-01`: Every treatment code referenced in an invoice must have an active price at time of invoice generation.

---

## Domain Services

### ScheduleAvailabilityService — Scheduling

**Responsibility**: Checks veterinarian availability and time slot conflicts. Queries Appointment and Veterinarian aggregate state.
**Consumes**: Appointment aggregate state, Veterinarian aggregate state
**Produces**: Availability query results

### PricingService — Billing

**Responsibility**: Calculates line item prices based on treatment codes and the active PriceList. Prices are snapshot at invoice generation time.
**Consumes**: ClinicalEpisode events, PriceList aggregate state
**Produces**: Priced line items for invoice generation

---

## Policies

### OpenVisitOnCheckIn — Clinical Care

**Trigger**: `PatientCheckedIn`
**Action**: Initiates VisitLifecycleSaga
**Rule**: When a patient checks in for an appointment (scheduled or walk-in), the visit lifecycle saga begins.

### GenerateInvoiceOnVisitClosed — Billing

**Trigger**: `VisitClosed`
**Action**: Issues `GenerateInvoice` command
**Rule**: When a visit is closed, an invoice is automatically generated from clinical episode line items. Prices are captured at the moment of generation (point-in-time snapshot per INV-IN-03).

---

## Sagas

### VisitLifecycleSaga — Clinical Care

**Trigger**: `PatientCheckedIn`
**Steps**:
1. Open visit (issue `OpenVisit` command)
2. Await clinical episodes (one or more — cardinality is one-to-many)
3. Close visit on veterinarian command (`CloseVisit`) — requires at least one completed episode (INV-VS-04)
4. Emit `VisitClosed` for downstream invoice generation

**Completion**: `VisitClosed` emitted successfully.

**Compensation**: If visit is abandoned (patient leaves without treatment), saga transitions to `abandoned` state and emits `VisitAbandoned`. No invoice generated.

**Timeout**: Configurable per clinic. Default warning at 12 hours (`VisitTimeoutWarning` — informational, consumed by notification infrastructure). Auto-abandon at 24 hours (`VisitAbandoned`).

**Events**:
- `VisitAbandoned` — Payload: visitId, abandonedAt, reason (timeout | manual).
- `VisitTimeoutWarning` — Payload: visitId, warningAt, timeoutThreshold.

**Invariants**:
- `INV-SAGA-01`: A visit in open state must transition to completed or abandoned within the configured timeout window.

---

## Projections

### AppointmentCalendarView — Scheduling

**Purpose**: Daily/weekly calendar view of all appointments by veterinarian.
**Consumes**: `AppointmentBooked`, `AppointmentRescheduled`, `AppointmentCancelled`

### ClinicalHistoryView — Clinical Care

**Purpose**: Complete clinical history for an animal. Formerly PatientHistoryView in Patient Records (moved per SG-06 resolution).
**Consumes**: `AnimalRegistered`, `DiagnosisRecorded`, `EpisodeCompleted`, `MedicationAdministered`

### OwnerAccountView — Billing

**Purpose**: Outstanding invoices and payment history for an owner.
**Consumes**: `InvoiceGenerated`, `PaymentRecorded`, `InvoiceDisputed`, `InvoiceRefunded`

---

## Design Principles

1. **Each animal is treated as an independent patient.** Appointments are per-animal. Invoices are per-visit (one animal per visit). Multi-pet billing, combined appointments, and sibling discounts are deferred to V2.

---

## Glossary

| Term | Definition | Context |
|------|-----------|---------|
| Appointment | A scheduled or walk-in time slot linking a patient to a veterinarian | Scheduling |
| Visit | A clinical encounter — the medical work performed at the clinic. Does not require a preceding appointment (walk-ins). | Clinical Care |
| Clinical Episode | A single clinical workflow within a visit: initiation, diagnosis, medication, completion. A visit has one or more episodes. Formerly "Treatment." | Clinical Care |
| Treatment | A single clinical intervention (medication, procedure). A line item within a clinical episode. | Clinical Care |
| Patient (Scheduling) | The animal identified in an appointment | Scheduling |
| Patient (Patient Records) | The animal's persistent identity and medical history | Patient Records |
| Patient (Clinical Care) | The animal currently under active care | Clinical Care |
| Owner | The person responsible for a patient. Must have at least one contact method. | Patient Records |
| Invoice | An itemized bill generated from a closed visit. Prices are immutable after generation. | Billing |
| PriceList | The set of active prices for treatment codes. Static mapping for V1. | Billing |
| Walk-in | An unscheduled visit where appointment and check-in happen simultaneously | Scheduling |
| Veterinarian | A licensed practitioner with defined availability windows | Scheduling |

---

## V2 Deferred Items

| Item | Source | Description |
|------|--------|-------------|
| Dynamic pricing | DG-02 | Price by veterinarian + time + code |
| Multi-pet scheduling | DG-04 | Combined appointments for sibling animals |
| Multi-pet billing | DG-04 | Sibling discounts, combined invoices |
| Context split: Scheduling | HG-P2-01 | If room/equipment booking added, split Scheduling context |
