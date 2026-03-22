# Contributing to Signal-Driven Development

Thank you for your interest in contributing to SDD. This is a documentation and methodology repository. Contributions are ideas, templates, examples, and editorial improvements, not code.

## What We Welcome

- **Worked examples** from your own domain analyses (anonymized)
- **Template improvements** such as clarifications, additional fields, or better structure
- **Gap category refinements** including new heuristic thresholds and additional examples
- **Editorial fixes** like typos, broken links, or unclear phrasing
- **Translations** of the templates and guides into other languages

## What Requires Discussion First

Open an issue before submitting a PR for:

- New templates or gap categories
- Changes to the convergence model or methodology structure
- Tooling additions (scripts, automation, integrations)

## How to Submit a Worked Example

1. Fork this repository.
2. Create a directory under `examples/` with a descriptive name (e.g., `examples/e-commerce-platform/`).
3. Follow the same structure as the veterinary clinic example:
   - `README.md` with domain description and convergence trajectory
   - `pass-N/` directories with domain specification, gap report, and gap resolution log
4. **Anonymize your domain.** Change entity names, business rules, and any identifying details.
5. Submit a pull request using the provided template.

## Formatting Conventions

To keep the repository consistent:

- **Gap IDs** follow the pattern `{CATEGORY}-{PASS_PREFIX}-{NUMBER}` (e.g., `SG-01`, `HG-P2-01`)
- **Severity levels** are `ERROR` or `WARNING` only
- **Invariant IDs** follow the pattern `INV-{AGGREGATE_ABBREVIATION}-{NUMBER}` (e.g., `INV-AP-01`)
- **Template metadata** uses the blockquote header format shown in templates
- Use ATX-style headings (`#`, `##`, `###`)
- One sentence per line in narrative sections (for cleaner diffs)

## Review Process

All contributions are reviewed by the maintainer. For methodology changes, expect discussion. SDD emerged from practice, and changes should be grounded in real domain modeling experience.

## Getting Help

- Open a Methodology Question issue for help applying SDD
- Read the [Quick Start Guide](docs/quickstart.md) for a walkthrough
- See the [FAQ](docs/faq.md) for common questions
