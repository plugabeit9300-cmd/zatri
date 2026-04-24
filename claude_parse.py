"""PDF → structured parts, via the Claude Code CLI.

Uses `claude -p` authenticated by the CLAUDE_CODE_OAUTH_TOKEN env var —
no Anthropic API key needed. The CLI reads the PDF path via an @-mention
in the prompt.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
from pathlib import Path
from typing import Any

import streamlit as st

from bootstrap import ensure_claude_cli


VALID_CATEGORIES = [
    "Fittings & Valves",
    "Instrumentation & Sensors",
    "Piping & Tubing",
    "Hardware & Gaskets",
]


PARSE_SYSTEM_PROMPT = """You are a procurement data extraction assistant for an engineering company operating high-temperature process equipment (target 250–300°C service).

Extract all line items from the vendor quote and return ONLY a valid JSON array. Each object must conform exactly to this schema:
{
  "partNumber": "string — manufacturer exact part number",
  "description": "string — leads with functional name e.g. 'Ball Valve, 1/2\\" BSPT, Full Bore, SS316'",
  "manufacturer": "string — OEM brand name",
  "vendor": "string — the company selling/quoting (from header)",
  "material": "string — e.g. SS316, PTFE, S235. Use '—' for electronics/cables",
  "connection": "string — port or connection type e.g. '1/4\\" NPT'",
  "unitPrice": number,
  "currency": "ILS or USD",
  "status": "Quoted",
  "leadTime": "string — e.g. 'In stock', '4 weeks', '32 days'",
  "tempRated300": boolean,
  "tempRatingC": number or null,
  "pressureRatingBar": number or null,
  "category": "exactly one of: Fittings & Valves | Instrumentation & Sensors | Piping & Tubing | Hardware & Gaskets",
  "quoteRef": "string — vendor name + quote number e.g. 'Scope #14509910'",
  "date": "YYYY-MM-DD",
  "catalogLink": null,
  "cadFile": null
}

Rules:
- Never use "N/A" — use null for unknown fields
- tempRated300: true ONLY if explicitly rated ≥300°C in the quote/datasheet
- PTFE parts: always tempRated300: false, tempRatingC: 260
- Electronics/instruments: tempRated300: false, tempRatingC: null unless stated
- material must be "—" for cables and electronic instruments
- description must lead with functional name, never part number
- category must be exactly one of the four strings above
- cadFile is always null
- Return ONLY the JSON array, no markdown, no preamble"""


class ParseError(RuntimeError):
    pass


def _extract_json_array(text: str) -> list[dict[str, Any]]:
    cleaned = re.sub(r"```(?:json)?", "", text).strip().strip("`").strip()
    start = cleaned.find("[")
    end = cleaned.rfind("]")
    if start == -1 or end == -1 or end <= start:
        raise ParseError("No JSON array found in model response.")
    snippet = cleaned[start : end + 1]
    try:
        arr = json.loads(snippet)
    except json.JSONDecodeError as e:
        raise ParseError(f"Model response was not valid JSON: {e}") from e
    if not isinstance(arr, list):
        raise ParseError("Model did not return a JSON array.")
    return arr


def parse_pdf(pdf_path: Path, timeout_s: int = 300) -> list[dict[str, Any]]:
    """Run Claude CLI on the given PDF path, return the extracted list."""
    claude_bin = ensure_claude_cli()

    prompt = (
        f"{PARSE_SYSTEM_PROMPT}\n\n"
        f"Extract all quoted line items from @{pdf_path} "
        "and return the JSON array as instructed."
    )

    env = os.environ.copy()
    env["CLAUDE_CODE_OAUTH_TOKEN"] = st.secrets["CLAUDE_CODE_OAUTH_TOKEN"]
    env["CI"] = "1"
    env["TERM"] = "dumb"

    cmd = [
        claude_bin,
        "-p", prompt,
        "--output-format", "json",
        "--permission-mode", "bypassPermissions",
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout_s,
            env=env,
            stdin=subprocess.DEVNULL,
        )
    except subprocess.TimeoutExpired as e:
        tail_out = (e.stdout or b"").decode(errors="ignore")[-500:] if e.stdout else ""
        tail_err = (e.stderr or b"").decode(errors="ignore")[-500:] if e.stderr else ""
        raise ParseError(
            f"claude timed out after {timeout_s}s.\n"
            f"stdout tail: {tail_out}\nstderr tail: {tail_err}"
        ) from e

    if result.returncode != 0:
        raise ParseError(
            f"claude exited {result.returncode}: "
            f"{(result.stderr or result.stdout or '').strip()[:500]}"
        )

    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError as e:
        raise ParseError(f"CLI did not return JSON wrapper: {e}\n{result.stdout[:500]}") from e

    if payload.get("is_error"):
        raise ParseError(f"Claude reported error: {payload.get('result', payload)}")

    text = payload.get("result", "")
    return _extract_json_array(text)


def validate_parts(raw: list[dict[str, Any]], next_id: int) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Port of VALIDATE_PARTS from ep_dashboard.tsx."""
    parts, warnings = [], []
    next_id = int(next_id)
    for p in raw:
        w: list[str] = []
        p = dict(p)

        if p.get("category") not in VALID_CATEGORIES:
            p["category"] = "Instrumentation & Sensors"
            w.append("category auto-corrected")

        price = p.get("unitPrice")
        if not isinstance(price, (int, float)):
            try:
                p["unitPrice"] = float(price) if price is not None else 0.0
            except (TypeError, ValueError):
                p["unitPrice"] = 0.0
            w.append("price coerced")

        if p.get("currency") not in ("ILS", "USD"):
            p["currency"] = "ILS"
            w.append("currency defaulted to ILS")

        if not isinstance(p.get("tempRated300"), bool):
            p["tempRated300"] = False
            w.append("tempRated300 defaulted false")

        mat = (p.get("material") or "").upper()
        if "PTFE" in mat and p.get("tempRated300"):
            p["tempRated300"] = False
            p["tempRatingC"] = 260
            w.append("PTFE: tempRated300 forced false")

        if p.get("tempRated300") and not p.get("tempRatingC"):
            w.append("tempRated300=true but tempRatingC missing")

        p["id"] = next_id
        next_id += 1
        p["status"] = "Quoted"
        p["cadFile"] = None

        if w:
            warnings.append({"partNumber": p.get("partNumber"), "warnings": w})
        parts.append(p)
    return parts, warnings
