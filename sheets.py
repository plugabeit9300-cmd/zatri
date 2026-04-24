"""Google Sheets layer — the single source of truth for the app.

Three worksheets inside the spreadsheet: `parts`, `documents`, `vendors`.
Row shapes mirror the data in ep_dashboard.tsx.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import gspread
import streamlit as st
from google.oauth2.service_account import Credentials


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

PARTS_COLUMNS = [
    "id", "partNumber", "description", "manufacturer", "vendor",
    "material", "connection", "unitPrice", "currency", "status",
    "leadTime", "tempRated300", "tempRatingC", "pressureRatingBar",
    "category", "quoteRef", "date", "catalogLink", "cadFile",
]

DOCUMENTS_COLUMNS = [
    "id", "title", "manufacturer", "type", "date", "quoteRef", "catalogLink", "pdfLink",
]

VENDORS_COLUMNS = [
    "key", "company", "website", "email", "phone", "country", "notes",
]

NUMERIC_PART_FIELDS = {"unitPrice", "tempRatingC", "pressureRatingBar", "id"}
BOOL_PART_FIELDS = {"tempRated300"}


@lru_cache(maxsize=1)
def _client() -> gspread.Client:
    creds = Credentials.from_service_account_info(
        dict(st.secrets["gcp_service_account"]),
        scopes=SCOPES,
    )
    return gspread.authorize(creds)


@lru_cache(maxsize=1)
def _spreadsheet():
    sid = st.secrets["procurement_spreadsheet_id"]
    return _client().open_by_key(sid)


def _worksheet(name: str, columns: list[str]) -> gspread.Worksheet:
    ss = _spreadsheet()
    try:
        ws = ss.worksheet(name)
    except gspread.WorksheetNotFound:
        ws = ss.add_worksheet(title=name, rows=1000, cols=max(len(columns), 10))
        ws.update("A1", [columns])
        return ws
    first_row = ws.row_values(1)
    if first_row != columns:
        ws.update("A1", [columns])
    return ws


def _coerce_part(row: dict[str, Any]) -> dict[str, Any]:
    out = dict(row)
    for k in NUMERIC_PART_FIELDS:
        v = out.get(k)
        if v in ("", None):
            out[k] = None
        else:
            try:
                fv = float(v)
                out[k] = int(fv) if k == "id" or (fv.is_integer() and k != "unitPrice") else fv
            except (TypeError, ValueError):
                out[k] = None
    for k in BOOL_PART_FIELDS:
        v = out.get(k)
        if isinstance(v, bool):
            continue
        out[k] = str(v).strip().lower() in ("true", "1", "yes")
    for k, v in out.items():
        if v == "":
            out[k] = None
    return out


def _row_values(record: dict[str, Any], columns: list[str]) -> list[Any]:
    row = []
    for c in columns:
        v = record.get(c)
        if v is None:
            row.append("")
        elif isinstance(v, bool):
            row.append("TRUE" if v else "FALSE")
        else:
            row.append(v)
    return row


def read_parts() -> list[dict[str, Any]]:
    ws = _worksheet("parts", PARTS_COLUMNS)
    rows = ws.get_all_records(expected_headers=PARTS_COLUMNS)
    return [_coerce_part(r) for r in rows]


def read_documents() -> list[dict[str, Any]]:
    ws = _worksheet("documents", DOCUMENTS_COLUMNS)
    return ws.get_all_records(expected_headers=DOCUMENTS_COLUMNS)


def read_vendors() -> dict[str, dict[str, Any]]:
    ws = _worksheet("vendors", VENDORS_COLUMNS)
    rows = ws.get_all_records(expected_headers=VENDORS_COLUMNS)
    return {r["key"]: r for r in rows if r.get("key")}


def append_parts(parts: list[dict[str, Any]]) -> None:
    if not parts:
        return
    ws = _worksheet("parts", PARTS_COLUMNS)
    values = [_row_values(p, PARTS_COLUMNS) for p in parts]
    ws.append_rows(values, value_input_option="USER_ENTERED")


def append_document(doc: dict[str, Any]) -> None:
    ws = _worksheet("documents", DOCUMENTS_COLUMNS)
    ws.append_row(_row_values(doc, DOCUMENTS_COLUMNS), value_input_option="USER_ENTERED")


def next_part_id(existing: list[dict[str, Any]]) -> int:
    ids = [int(p["id"]) for p in existing if p.get("id") is not None]
    return (max(ids) + 1) if ids else 1


def seed_if_empty(seed_path: Path) -> bool:
    """Populate the three sheets from seed.json on first run. Returns True if seeded."""
    ws_parts = _worksheet("parts", PARTS_COLUMNS)
    existing = ws_parts.get_all_values()
    if len(existing) > 1:  # header + at least one data row
        return False

    data = json.loads(seed_path.read_text())

    append_parts(data["PARTS_INIT"])

    ws_docs = _worksheet("documents", DOCUMENTS_COLUMNS)
    ws_docs.append_rows(
        [_row_values(d, DOCUMENTS_COLUMNS) for d in data["DOCUMENTS_INIT"]],
        value_input_option="USER_ENTERED",
    )

    ws_vendors = _worksheet("vendors", VENDORS_COLUMNS)
    vendor_rows = []
    for key, v in data["VENDORS_INFO"].items():
        vendor_rows.append(_row_values({"key": key, **v}, VENDORS_COLUMNS))
    ws_vendors.append_rows(vendor_rows, value_input_option="USER_ENTERED")

    return True
