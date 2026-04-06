# Methodology Overview

## What is Signal-Driven Development?

Signal-Driven Development (SDD) is a rigorous, solo-practitioner methodology that extends Domain-Driven Design with:

1. **A structured three-pass convergence process** -- iterative refinement of domain specifications through diagnostic feedback
2. **Diagnostic feedback loops via gap reports** -- structured evaluation against four categories of gaps
3. **A measurable definition of done** -- zero unresolved gaps

Traditional DDD knowledge crunching assumes collaborative workshops, domain expert interviews, and EventStorming sessions. SDD replaces the social feedback loop with a structured diagnostic one. A solo builder writes the specification, runs the gap report, and resolves the gaps. The gap report acts as the "second pair of eyes."

## The Problem SDD Solves

DDD has never had a definition of done. An architect builds a domain model and... when is it complete? When does it stop being a draft and become implementation-ready? The answer has always been "when it feels right" or "when the team agrees." For solo practitioners, there is no team to agree. There is no EventStorming room. There is only the architect and the model.

SDD provides a measurable answer: **the model is done when the gap report returns zero unresolved gaps.** This does not mean the model is perfect. It means every question the model raised has been answered -- either by changing the specification or by documenting why the current design is intentional.

## Core Principles

### Gaps are signals, not verdicts

A gap report identifies diagnostic signals. The architect reads, investigates, and resolves each gap. Some gaps result in specification changes. Others are documented as intentional design decisions. The gap report does not make architectural decisions -- it surfaces the questions that the architect must answer.

### Convergence is non-negotiable

Each pass must reduce the gap count. If the gap count increases between passes, the specification is diverging. Non-convergence is the most important signal the process can produce. It means a resolution introduced more complexity than it removed, and the root cause must be investigated.

### Immutable artifacts

Gap reports and resolution logs are immutable snapshots. They record what was found and what was decided at that point in time. The domain specification is the living document that evolves across passes. This separation ensures traceability -- you can always see how the model evolved and why.

### Four gap categories with measurable thresholds

Gaps are not subjective. Each category has specific rules, and heuristic gaps have measurable thresholds sourced from the DDD literature (Evans, Vernon, Brandolini, Khononov). See [[Gap Categories]] for the full reference.

## How It Works

1. **Write a domain specification** using DDD building blocks (bounded contexts, aggregates, commands, events, invariants, policies, sagas, projections)
2. **Run a gap report** evaluating the specification against four categories: Structural, Heuristic, Language, and Decision gaps
3. **Resolve each gap** by accepting, modifying, or rejecting the recommendation -- with documented rationale
4. **Update the specification** with all accepted resolutions
5. **Repeat** until zero unresolved gaps remain

See [[Convergence Model]] for the detailed process flow and [[Quick Start Guide]] to get started.

## When to Use SDD

SDD is designed for:

- **Solo practitioners** building domain models without a team
- **Small teams** who want structured DDD feedback without full EventStorming workshops
- **AI-assisted modeling** -- the structured templates work well with AI for gap identification and resolution drafting
- **Any DDD project** that needs a definition of done for domain modeling

SDD is **not** a replacement for EventStorming or collaborative discovery. It is a convergence technique that takes a domain specification (however produced) and drives it to completeness.

## Methodology Version

SDD follows semantic versioning:

- **MAJOR**: Breaking changes to templates, gap categories, or the convergence model
- **MINOR**: New templates, examples, fields, or documentation sections
- **PATCH**: Typo fixes, clarifications, editorial improvements

Current version: **v1.0.0** (released 2026-03-20). See [[Changelog]] for details.
