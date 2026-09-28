#!/usr/bin/env bash
set -euo pipefail

DIFF=$(git diff --cached 2>/dev/null || git diff HEAD 2>/dev/null || echo "")

if echo "$DIFF" | grep -Ei "(client_secret|api_key|password)s*[:=]s*['"][A-Za-z0-9_-]{8,}['"]" >/dev/null; then
    echo "[SECRET-GUARD] Possible hardcoded secret detected in git diff! Aborting."
    exit 1
fi
