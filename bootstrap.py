"""Ensure the `claude` CLI is on PATH at runtime.

Streamlit Community Cloud installs apt packages from packages.txt
(nodejs, npm) but won't run npm for us. On first import we npm-install
the CLI to $HOME/.local so it lives in the user-writable area, then
prepend that dir to PATH for the current process.

On a laptop where Claude Code is already installed globally this is a
no-op.
"""
from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path


def ensure_claude_cli() -> str:
    existing = shutil.which("claude")
    if existing:
        return existing

    local_prefix = Path.home() / ".local"
    local_bin = local_prefix / "bin"
    os.environ["PATH"] = f"{local_bin}:{os.environ.get('PATH', '')}"

    candidate = shutil.which("claude")
    if candidate:
        return candidate

    subprocess.run(
        [
            "npm",
            "install",
            "-g",
            f"--prefix={local_prefix}",
            "@anthropic-ai/claude-code",
        ],
        check=True,
        capture_output=True,
    )

    candidate = shutil.which("claude")
    if not candidate:
        raise RuntimeError(
            "Installed @anthropic-ai/claude-code but `claude` is still not on PATH."
        )

    # Warm-up call so any first-run onboarding (cache dirs, self-update check)
    # happens here — not inside the parse_pdf timeout window.
    try:
        subprocess.run(
            [candidate, "--version"],
            capture_output=True,
            timeout=30,
            stdin=subprocess.DEVNULL,
        )
    except Exception:
        pass

    return candidate
