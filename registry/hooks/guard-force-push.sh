#!/usr/bin/env bash
set -euo pipefail

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
if [[ "$BRANCH" =~ ^(main|master|production|uat)$ ]]; then
    echo "[GUARD] Force push to protected branch $BRANCH is forbidden."
    exit 1
fi
