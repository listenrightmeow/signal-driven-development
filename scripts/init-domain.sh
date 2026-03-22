#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$SCRIPT_DIR/../templates"

usage() {
    echo "Usage: $0 <domain-name> [pass-number]"
    echo ""
    echo "Scaffolds a new domain analysis directory from the SDD templates."
    echo ""
    echo "Arguments:"
    echo "  domain-name   Name of the domain (e.g., 'My Project')"
    echo "  pass-number   Pass number (default: 1)"
    echo ""
    echo "Example:"
    echo "  $0 'E-Commerce Platform' 1"
    exit 1
}

if [ $# -lt 1 ]; then
    usage
fi

DOMAIN_NAME="$1"
PASS_NUMBER="${2:-1}"

# Convert domain name to directory-safe slug
DIR_NAME=$(echo "$DOMAIN_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
PASS_DIR="$DIR_NAME/pass-$PASS_NUMBER"
DATE=$(date +%Y-%m-%d)

if [ -d "$PASS_DIR" ]; then
    echo "Error: Directory '$PASS_DIR' already exists."
    exit 1
fi

mkdir -p "$PASS_DIR"

# Copy and customize templates
for template in domain-specification.md gap-report.md gap-resolution-log.md architecture-palette.md; do
    if [ -f "$TEMPLATE_DIR/$template" ]; then
        sed -e "s/\[Domain Name\]/$DOMAIN_NAME/g" \
            -e "s/Pass N/Pass $PASS_NUMBER/g" \
            -e "s/\[YYYY-MM-DD\]/$DATE/g" \
            "$TEMPLATE_DIR/$template" > "$PASS_DIR/$template"
    fi
done

echo "Created $PASS_DIR/ with templates for '$DOMAIN_NAME' (Pass $PASS_NUMBER)"
echo ""
echo "Files:"
ls -1 "$PASS_DIR/"
echo ""
echo "Next: Open $PASS_DIR/domain-specification.md and start writing your domain model."
