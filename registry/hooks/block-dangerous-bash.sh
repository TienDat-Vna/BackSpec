#!/usr/bin/env bash
set -euo pipefail

COMMAND="$*"

if [[ "$COMMAND" =~ (rm[[:space:]]+-rf[[:space:]]+(/|~|*)) ]]; then
    echo "[SECURITY-GUARD] Blocked dangerous recursive deletion: $COMMAND"
    exit 1
fi

if [[ "$COMMAND" =~ (DROP[[:space:]]+TABLE|TRUNCATE[[:space:]]+TABLE|DROP[[:space:]]+DATABASE) ]]; then
    echo "[SECURITY-GUARD] Blocked manual DDL destructive command outside migration tool: $COMMAND"
    exit 1
fi
