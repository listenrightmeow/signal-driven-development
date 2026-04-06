# Contributing

Contributions are welcome -- especially worked examples from your own domains (anonymized).

SDD is a documentation and methodology repository. Contributions are ideas, templates, examples, and editorial improvements, not code.

## What We Welcome

- **Worked examples** from your own domain analyses (anonymized)
- **Template improvements** -- clarifications, additional fields, better structure
- **Gap category refinements** -- new heuristic thresholds, additional examples
- **Editorial fixes** -- typos, broken links, unclear phrasing
- **Translations** of the templates and guides into other languages

## What Requires Discussion First

Open an issue before submitting a PR for:

- New templates or gap categories
- Changes to the convergence model or methodology structure
- Tooling additions (scripts, automation, integrations)

## Submitting a Worked Example

1. Fork the repository
2. Create a directory under `examples/` with a descriptive name (e.g., `examples/e-commerce-platform/`)
3. Follow the same structure as the [[Worked Example: Veterinary Clinic]]:
   - `README.md` with domain description and convergence trajectory
   - `pass-N/` directories with domain specification, gap report, and gap resolution log
4. **Anonymize your domain** -- change entity names, business rules, and any identifying details
5. Submit a pull request using the provided template

## Formatting Conventions

| Convention | Format | Example |
|-----------|--------|---------|
| Gap IDs | `{CATEGORY}-{PASS_PREFIX}-{NUMBER}` | `SG-01`, `HG-P2-01` |
| Severity levels | `ERROR` or `WARNING` only | |
| Invariant IDs | `INV-{AGGREGATE_ABBREVIATION}-{NUMBER}` | `INV-AP-01` |
| Template metadata | Blockquote header format | |
| Headings | ATX-style (`#`, `##`, `###`) | |
| Narrative sections | One sentence per line | (for cleaner diffs) |

## Issue Templates

The repository provides three issue templates:

| Template | Use When |
|----------|----------|
| **Example Submission** | Submitting a new worked example |
| **Template Improvement** | Proposing changes to SDD templates |
| **Methodology Question** | Asking for help applying SDD |

## Review Process

All contributions are reviewed by the maintainer. For methodology changes, expect discussion. SDD emerged from practice, and changes should be grounded in real domain modeling experience.

## Getting Help

- Open a **Methodology Question** issue for help applying SDD
- Read the [[Quick Start Guide]] for a walkthrough
- See the [[FAQ]] for common questions
