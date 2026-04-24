#!/usr/bin/env bash
# Local dev convenience. Streamlit Community Cloud ignores this file;
# the app bootstraps Claude Code CLI at runtime via bootstrap.py.
set -euo pipefail

if ! command -v node >/dev/null; then
  echo "Install Node.js first: https://nodejs.org/"
  exit 1
fi

if ! command -v claude >/dev/null; then
  npm install -g @anthropic-ai/claude-code
fi

echo "Claude Code CLI: $(claude --version)"
echo "Now run:  streamlit run app.py"
