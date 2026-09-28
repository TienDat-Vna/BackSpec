#!/usr/bin/env bash
set -euo pipefail

FILE="$1"
PROTECTED_PATTERN="(.env|.env.production|CONSTITUTION.md|CLAUDE.md|AGENTS.md)"

if [[ "$FILE" =~ $PROTECTED_PATTERN ]]; then
    echo "[GUARD] File $FILE is protected. Modification requires human approval."
    exit 1
fi
