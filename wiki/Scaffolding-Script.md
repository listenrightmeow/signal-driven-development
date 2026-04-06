# Scaffolding Script

**File:** `scripts/init-domain.sh`

The scaffolding script automates the setup of a new domain analysis directory with customized templates.

## Usage

```bash
./scripts/init-domain.sh <domain-name> [pass-number]
```

### Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| `domain-name` | Yes | -- | Name of the domain (e.g., "My Project") |
| `pass-number` | No | 1 | Pass number for this analysis |

### Examples

```bash
# Start a new domain analysis
./scripts/init-domain.sh "E-Commerce Platform" 1

# Start Pass 2 for an existing domain
./scripts/init-domain.sh "E-Commerce Platform" 2
```

## What It Does

1. Converts the domain name to a directory-safe slug (lowercase, hyphens)
2. Creates the directory structure: `{slug}/pass-{N}/`
3. Copies all four templates into the pass directory
4. Replaces placeholders:
   - `[Domain Name]` → your domain name
   - `Pass N` → the pass number
   - `[YYYY-MM-DD]` → today's date
5. Reports the created files

## Output

```text
Created e-commerce-platform/pass-1/ with templates for 'E-Commerce Platform' (Pass 1)

Files:
architecture-palette.md
domain-specification.md
gap-report.md
gap-resolution-log.md

Next: Open e-commerce-platform/pass-1/domain-specification.md and start writing your domain model.
```

## Error Handling

The script will exit with an error if:

- No domain name is provided
- The target directory already exists (prevents accidental overwrites)

## Next Steps

After running the script, follow the [[Quick Start Guide]] starting from Step 2.
