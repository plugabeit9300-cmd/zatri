"""Google Drive layer — archives uploaded PDFs to a shared folder.

The folder is shared (Editor) with the same service account used for Sheets.
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import streamlit as st
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload


SCOPES = ["https://www.googleapis.com/auth/drive"]


@lru_cache(maxsize=1)
def _service():
    creds = Credentials.from_service_account_info(
        dict(st.secrets["gcp_service_account"]),
        scopes=SCOPES,
    )
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def upload_pdf(pdf_path: Path, filename: str) -> dict[str, Any]:
    """Upload a PDF into the configured Drive folder.

    Returns a dict with keys 'id' and 'webViewLink'.
    """
    folder_id = st.secrets["procurement_drive_folder_id"]
    svc = _service()
    metadata = {"name": filename, "parents": [folder_id]}
    media = MediaFileUpload(str(pdf_path), mimetype="application/pdf", resumable=False)
    return svc.files().create(
        body=metadata,
        media_body=media,
        fields="id, webViewLink",
        supportsAllDrives=True,
    ).execute()
