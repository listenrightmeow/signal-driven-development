# Domain Specification — Greenfield Veterinary Clinic (Pass 1)

> **Source Input**: Product requirements document (fictional)
> **Pass**: 1
> **Date**: 2026-03-20
> **Status**: Gap report pending

---

## Bounded Contexts

### Scheduling

**Responsibility**: Manages appointment lifecycle — booking, rescheduling, cancellation, and check-in.
**Upstream dependencies**: Patient Records (needs patient identity)
**Downstream consumers**: Clinical Care (appointment triggers visit)
**Relationship type**: Customer-Supplier (Scheduling consumes Patient Records)

### Patient Records

**Responsibility**: Maintains animal profiles, owner information, and medical history.
**Upstream dependencies**: None
**Downstream consumers**: Scheduling, Clinical Care, Billing

### Clinical Care

**Responsibility**: Manages veterinary visits, diagnoses, treatments, and prescriptions.
**Upstream dependencies**: Scheduling (visit triggered by appointment), Patient Records (medical history)
**Downstream consumers**: Billing

### Billing

**Responsibility**: Generates invoices, tracks payments, and manages pricing.
**Upstream dependencies**: Clinical Care (treatment costs)
**Downstream consumers**: None

---

## Building Block Inventory

| Building Block | Pass 1 Count |
|----------------|-------------|
| Bounded Contexts | 4 |
| Aggregates | 6 |
| Domain Services | 2 |
| Value Objects | 8 |
| Commands | 14 |
| Domain Events | 12 |
| Policies | 3 |
| Sagas | 0 |
| Projections | 3 |
| Invariants | 5 |

---

## Aggregates

### Appointment — Scheduling

**Identity**: `appointmentId` (UUID)
**Responsibility**: Manages the lifecycle of a scheduled appointment.

**Commands**:

- `BookAppointment` — Schedules a new appointment. Preconditions: Time slot available. Emits: `AppointmentBooked`.
- `RescheduleAppointment` — Moves to a new time. Preconditions: Appointment exists, not completed. Emits: `AppointmentRescheduled`.
- `CancelAppointment` — Cancels the appointment. Preconditions: Appointment exists, not completed. Emits: `AppointmentCancelled`.
- `CheckInPatient` — Marks patient as arrived. Preconditions: Appointment exists, status is booked. Emits: `PatientCheckedIn`.

**Domain Events**:

- `AppointmentBooked` — Payload: appointmentId, patientId, veterinarianId, scheduledTime, visitType.
- `AppointmentRescheduled` — Payload: appointmentId, previousTime, newTime.
- `AppointmentCancelled` — Payload: appointmentId, reason.
- `PatientCheckedIn` — Payload: appointmentId, checkedInAt.

**Invariants**: (none defined)

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

### Treatment — Clinical Care

**Identity**: `treatmentId` (UUID)
**Responsibility**: Manages the full treatment lifecycle from diagnosis through completion.

**Commands**:

- `StartTreatment` — Initiates treatment for a visit. Emits: `TreatmentStarted`.
- `RecordDiagnosis` — Documents the veterinarian's diagnosis. Emits: `DiagnosisRecorded`.
- `AdministerMedication` — Records a medication given. Emits: `MedicationAdministered`.
- `CompleteTreatment` — Marks treatment as finished. Emits: `TreatmentCompleted`.

**Domain Events**:

- `TreatmentStarted` — Payload: treatmentId, visitId, animalId, veterinarianId.
- `DiagnosisRecorded` — Payload: treatmentId, diagnosisCode, notes.
- `MedicationAdministered` — Payload: treatmentId, medicationId, dosage.
- `TreatmentCompleted` — Payload: treatmentId, completedAt, summary.

**Invariants**:

- `INV-TR-01`: A treatment cannot be completed without at least one diagnosis recorded.
- `INV-TR-02`: Medication can only be administered after diagnosis.

### Invoice — Billing

**Identity**: `invoiceId` (UUID)
**Responsibility**: Generates and tracks payment for a visit.

**Commands**:

- `GenerateInvoice` — Creates invoice from treatment line items. Emits: `InvoiceGenerated`.
- `RecordPayment` — Marks full or partial payment. Emits: `PaymentRecorded`.

**Domain Events**:

- `InvoiceGenerated` — Payload: invoiceId, visitId, lineItems, totalAmount.
- `PaymentRecorded` — Payload: invoiceId, amount, method, remainingBalance.

**Invariants**:

- `INV-IN-01`: Invoice total must equal sum of line item amounts.

### Visit — Clinical Care

**Identity**: `visitId` (UUID)
**Responsibility**: Links an appointment to clinical activities.

**Commands**:

- `OpenVisit` — Initiates a clinical visit from a checked-in appointment. Emits: `VisitOpened`.
- `CloseVisit` — Marks the visit as complete. Emits: `VisitClosed`.

**Domain Events**:

- `VisitOpened` — Payload: visitId, appointmentId, animalId, veterinarianId.
- `VisitClosed` — Payload: visitId, closedAt.

**Invariants**: (none defined)

---

## Domain Services

### ScheduleAvailabilityService — Scheduling

**Responsibility**: Checks veterinarian availability and time slot conflicts.
**Consumes**: Appointment aggregate state
**Produces**: Availability query results

### PricingService — Billing

**Responsibility**: Calculates line item prices based on treatment codes and clinic pricing rules.
**Consumes**: Treatment events, pricing configuration
**Produces**: Priced line items for invoice generation

---

## Policies

### OpenVisitOnCheckIn — Clinical Care

**Trigger**: `PatientCheckedIn`
**Action**: Issues `OpenVisit` command
**Rule**: When a patient checks in for an appointment, a clinical visit is automatically opened.

### GenerateInvoiceOnVisitClosed — Billing

**Trigger**: `VisitClosed`
**Action**: Issues `GenerateInvoice` command
**Rule**: When a visit is closed, an invoice is automatically generated from treatment line items.

### NotifyOwnerOnAppointmentBooked — Scheduling

**Trigger**: `AppointmentBooked`
**Action**: Sends confirmation notification to owner
**Rule**: Owners receive confirmation when an appointment is booked.

---

## Projections

### AppointmentCalendarView — Scheduling

**Purpose**: Daily/weekly calendar view of all appointments by veterinarian.
**Consumes**: `AppointmentBooked`, `AppointmentRescheduled`, `AppointmentCancelled`

### PatientHistoryView — Patient Records

**Purpose**: Complete medical history for an animal.
**Consumes**: `AnimalRegistered`, `DiagnosisRecorded`, `TreatmentCompleted`, `MedicationAdministered`

### OwnerAccountView — Billing

**Purpose**: Outstanding invoices and payment history for an owner.
**Consumes**: `InvoiceGenerated`, `PaymentRecorded`

---

## Glossary

| Term | Definition | Context |
|------|-----------|---------|
| Patient | An animal receiving veterinary care | Patient Records |
| Visit | A single clinical encounter at the clinic | Clinical Care |
| Appointment | A scheduled time slot for a visit | Scheduling |
| Treatment | The clinical interventions performed during a visit | Clinical Care |
| Owner | The person responsible for a patient | Patient Records |
