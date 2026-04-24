"""Engineering Procurement Dashboard — Streamlit edition.

Data lives in a Google Sheet. PDFs are parsed by the Claude Code CLI
authenticated with a long-lived OAuth token. Designed for ~3 internal
users.
"""
from __future__ import annotations

import json
import tempfile
from pathlib import Path

import pandas as pd
import streamlit as st

import drive
import sheets
from claude_parse import ParseError, parse_pdf, preflight, validate_parts


SEED_PATH = Path(__file__).parent / "data" / "seed.json"
CATEGORIES = [
    "All Parts",
    "Fittings & Valves",
    "Instrumentation & Sensors",
    "Piping & Tubing",
    "Hardware & Gaskets",
]


st.set_page_config(
    page_title="ISI Procurement Dashboard",
    layout="wide",
    initial_sidebar_state="collapsed",
)


# ──────────────────────────────── auth gate ────────────────────────────────
def _gate() -> None:
    if st.session_state.get("authed"):
        return
    st.title("🔒 Engineering Procurement")
    pwd = st.text_input("Password", type="password", label_visibility="collapsed", placeholder="Password")
    if st.button("Enter", width="stretch") or pwd:
        if pwd == st.secrets["app_password"]:
            st.session_state["authed"] = True
            st.rerun()
        elif pwd:
            st.error("Wrong password.")
    st.stop()


_gate()


# ──────────────────────────────── data layer ────────────────────────────────
@st.cache_data(ttl=30, show_spinner=False)
def load_data() -> tuple[list[dict], list[dict], dict[str, dict]]:
    return sheets.read_parts(), sheets.read_documents(), sheets.read_vendors()


def _seed_once() -> None:
    if st.session_state.get("seed_checked"):
        return
    with st.spinner("Checking Google Sheet…"):
        seeded = sheets.seed_if_empty(SEED_PATH)
    if seeded:
        st.success("Seeded Google Sheet with initial parts/docs/vendors.")
        load_data.clear()
    st.session_state["seed_checked"] = True


_seed_once()
parts, documents, vendors_info = load_data()


# ──────────────────────────────── seed-derived reference ────────────────────────────────
@st.cache_data
def _market_map() -> dict:
    return json.loads(SEED_PATH.read_text())["MARKET_MAP"]


MARKET_MAP = _market_map()


# ──────────────────────────────── helpers ────────────────────────────────
def fmt_price(p, c) -> str:
    if p is None:
        return "—"
    sym = "₪" if c == "ILS" else "$"
    return f"{sym}{p:,.2f}"


def is_long_lead(lt: str | None) -> bool:
    if not lt or lt in ("In stock", "Ex stock", "—"):
        return False
    try:
        n = int(lt.split()[0])
    except (ValueError, IndexError):
        return False
    return "week" in lt.lower() and n >= 8


def maintenance_items(parts_list: list[dict], vendors: dict) -> list[dict]:
    out = []
    for p in parts_list:
        issues = []
        if not p.get("catalogLink"):
            issues.append("Missing catalog link")
        if p.get("vendor") not in vendors:
            issues.append("Vendor info not on record")
        if issues:
            out.append({
                "id": p.get("id"),
                "partNumber": p.get("partNumber"),
                "description": p.get("description"),
                "issues": ", ".join(issues),
            })
    return out


# ──────────────────────────────── header ────────────────────────────────
total_parts = len(parts)
unrated = sum(1 for p in parts if not p.get("tempRated300"))
maint_items = maintenance_items(parts, vendors_info)
pending = len(maint_items)

h1, h2, h3, h4 = st.columns([3, 1, 1, 1])
with h1:
    st.markdown("### Engineering Procurement Dashboard")
    st.caption("ISI R&D · Parts Database v4.0 · Google Sheets backed")
with h2:
    st.metric("Total parts", total_parts)
with h3:
    st.metric("Unrated ≥300°C", unrated)
with h4:
    st.metric("Pending tasks", pending, delta=None)


# ──────────────────────────────── upload panel ────────────────────────────────
def upload_panel() -> None:
    step = st.session_state.get("upload_step", "idle")

    with st.container(border=True):
        header_l, header_r = st.columns([6, 1])
        with header_l:
            st.markdown("### 📄 Upload vendor quote PDF")
        with header_r:
            if st.button("✕ Close", key="close_upload"):
                for k in ("show_upload", "upload_step", "parsed_parts", "parse_warnings",
                         "review_checked", "upload_file_bytes", "upload_file_name"):
                    st.session_state.pop(k, None)
                st.rerun()
        _upload_inner(step)


def _upload_inner(step: str) -> None:

    if step == "idle":
        f = st.file_uploader("Drop a vendor quote PDF", type=["pdf"], accept_multiple_files=False)
        if f is not None:
            st.session_state["upload_file_bytes"] = f.read()
            st.session_state["upload_file_name"] = f.name
            st.info(f"Ready to parse: **{f.name}** ({len(st.session_state['upload_file_bytes'])/1024:.1f} KB)")
            if st.button("Parse with Claude", type="primary", width="stretch"):
                st.session_state["upload_step"] = "parsing"
                st.rerun()
        return

    if step == "parsing":
        with st.status("Parsing PDF with Claude Code CLI…", expanded=True) as status:
            try:
                st.write("• Running preflight: `claude --version`")
                info = preflight()
                st.write(f"  ↳ binary: `{info['binary']}`")
                st.write(f"  ↳ version: `{info['version']}`")

                with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                    tmp.write(st.session_state["upload_file_bytes"])
                    tmp_path = Path(tmp.name)
                st.write(f"• Saved PDF to `{tmp_path}`")
                st.write("• Calling `claude -p` — live elapsed time below:")
                tick_area = st.empty()

                def tick(elapsed: float, _stderr_tail: str) -> None:
                    tick_area.markdown(
                        f"⏱ **{elapsed:0.1f} s** elapsed — still running…"
                    )

                raw = parse_pdf(tmp_path, on_tick=tick)
                tick_area.markdown("✅ Claude finished.")
                tmp_path.unlink(missing_ok=True)
                st.write(f"• Got {len(raw)} line items")
                next_id = sheets.next_part_id(parts)
                validated, warnings = validate_parts(raw, next_id)
                st.session_state["parsed_parts"] = validated
                st.session_state["parse_warnings"] = warnings
                st.session_state["review_checked"] = {p["id"]: True for p in validated}
                st.session_state["upload_step"] = "review"
                status.update(label=f"Parsed {len(validated)} items", state="complete")
            except ParseError as e:
                status.update(label="Parse failed", state="error")
                st.error(str(e))
                if st.button("Try a different PDF"):
                    st.session_state["upload_step"] = "idle"
                    st.rerun()
                return
            except Exception as e:
                status.update(label="Unexpected error", state="error")
                st.exception(e)
                if st.button("Start over"):
                    st.session_state["upload_step"] = "idle"
                    st.rerun()
                return
        st.rerun()

    if step == "review":
        validated = st.session_state["parsed_parts"]
        warnings = st.session_state["parse_warnings"]
        checked = st.session_state["review_checked"]

        st.write(f"**{len(validated)}** line items extracted. Uncheck any you don't want imported.")
        if warnings:
            with st.expander(f"⚠ {len(warnings)} warnings"):
                st.json(warnings)

        rows = []
        for p in validated:
            rows.append({
                "import": checked.get(p["id"], True),
                "partNumber": p.get("partNumber"),
                "description": p.get("description"),
                "category": p.get("category"),
                "unitPrice": p.get("unitPrice"),
                "currency": p.get("currency"),
                "vendor": p.get("vendor"),
                "_id": p["id"],
            })
        edited = st.data_editor(
            pd.DataFrame(rows),
            hide_index=True,
            disabled=["partNumber", "description", "category", "unitPrice", "currency", "vendor", "_id"],
            column_config={"_id": None},
            width="stretch",
            key="review_editor",
        )
        new_checked = {int(r["_id"]): bool(r["import"]) for _, r in edited.iterrows()}
        st.session_state["review_checked"] = new_checked

        c1, c2 = st.columns(2)
        with c1:
            if st.button("Cancel", width="stretch"):
                for k in ("upload_step", "parsed_parts", "parse_warnings", "review_checked",
                         "upload_file_bytes", "upload_file_name"):
                    st.session_state.pop(k, None)
                st.rerun()
        with c2:
            n_import = sum(1 for v in new_checked.values() if v)
            if st.button(f"Import {n_import} parts to Google Sheet", type="primary",
                         disabled=n_import == 0, width="stretch"):
                to_add = [p for p in validated if new_checked.get(p["id"])]
                sheets.append_parts(to_add)

                # Archive the PDF to Drive and get a shareable link
                pdf_link = ""
                file_name = st.session_state.get("upload_file_name", "quote.pdf")
                try:
                    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                        tmp.write(st.session_state["upload_file_bytes"])
                        archive_path = Path(tmp.name)
                    drive_result = drive.upload_pdf(archive_path, file_name)
                    pdf_link = drive_result.get("webViewLink", "")
                    archive_path.unlink(missing_ok=True)
                except Exception as e:
                    st.warning(f"Sheets write succeeded, but archiving PDF to Drive failed: {e}")

                q_ref = to_add[0].get("quoteRef") or file_name
                mfrs = " / ".join(sorted({p.get("manufacturer", "") for p in to_add if p.get("manufacturer")}))
                doc_id = f"d{len(documents) + 1}"
                sheets.append_document({
                    "id": doc_id,
                    "title": q_ref,
                    "manufacturer": mfrs,
                    "type": "Quote",
                    "date": to_add[0].get("date") or "",
                    "quoteRef": q_ref,
                    "catalogLink": "",
                    "pdfLink": pdf_link,
                })
                load_data.clear()
                for k in ("upload_step", "parsed_parts", "parse_warnings", "review_checked",
                         "upload_file_bytes", "upload_file_name"):
                    st.session_state.pop(k, None)
                st.session_state.pop("show_upload", None)
                st.success(f"Imported {len(to_add)} parts. Closing…")
                st.rerun()


# Render upload panel at the top when toggled on
if st.session_state.get("show_upload"):
    upload_panel()


# ──────────────────────────────── main tabs ────────────────────────────────
tab_parts, tab_docs, tab_maint = st.tabs([
    "Parts",
    "Document Library",
    f"Maintenance ({pending})",
])


# ─────── PARTS TAB ───────
with tab_parts:
    cfilter_cols = st.columns([4, 2, 2, 2, 2])
    with cfilter_cols[0]:
        search = st.text_input("Search", placeholder="Search part, description, manufacturer…",
                               label_visibility="collapsed")
    with cfilter_cols[1]:
        vendor_opts = ["All Vendors"] + sorted({p.get("vendor") for p in parts if p.get("vendor")})
        vendor_filter = st.selectbox("Vendor", vendor_opts, label_visibility="collapsed")
    with cfilter_cols[2]:
        min_temp = st.slider("Min temp °C", 0, 1200, 0, step=50)
    with cfilter_cols[3]:
        show_vendor_dir = st.toggle("Vendors", value=False)
    with cfilter_cols[4]:
        if st.button("📄 Upload Quote", type="primary", width="stretch"):
            st.session_state["show_upload"] = True
            st.session_state["upload_step"] = "idle"
            st.rerun()

    cat_tabs = st.tabs([
        f"{c} ({sum(1 for p in parts if c == 'All Parts' or p.get('category') == c)})"
        for c in CATEGORIES
    ])

    if show_vendor_dir:
        st.markdown("#### Vendor Directory")
        vcols = st.columns(min(len(vendors_info), 4) or 1)
        for i, (key, v) in enumerate(vendors_info.items()):
            with vcols[i % len(vcols)]:
                st.markdown(f"**{v.get('company', key)}**")
                st.caption(v.get("notes", ""))
                if v.get("phone"):
                    st.write(f"☎ {v['phone']}")
                if v.get("email"):
                    st.write(f"✉ {v['email']}")
                if v.get("website"):
                    st.write(f"🌐 [{v['website'].replace('https://', '')}]({v['website']})")
                if v.get("country"):
                    st.write(f"📍 {v['country']}")
        st.caption("⚠ Contact details are best-effort — verify against original quote documents.")
        st.divider()

    for i, cat in enumerate(CATEGORIES):
        with cat_tabs[i]:
            filtered = list(parts)
            if cat != "All Parts":
                filtered = [p for p in filtered if p.get("category") == cat]
            if vendor_filter != "All Vendors":
                filtered = [p for p in filtered if p.get("vendor") == vendor_filter]
            if min_temp > 0:
                filtered = [p for p in filtered if p.get("tempRatingC") is not None
                            and p["tempRatingC"] >= min_temp]
            if search.strip():
                q = search.lower()
                filtered = [p for p in filtered if any(
                    q in str(p.get(k, "")).lower()
                    for k in ("partNumber", "description", "manufacturer", "vendor")
                )]

            if not filtered:
                st.info("No parts match the current filters.")
                continue

            df = pd.DataFrame([{
                "Part Number": p.get("partNumber"),
                "Description": p.get("description"),
                "Manufacturer": f"{p.get('manufacturer', '')} · via {p.get('vendor', '')}",
                "Unit Price": fmt_price(p.get("unitPrice"), p.get("currency")),
                "Temp °C": p.get("tempRatingC"),
                "Lead Time": ("⚠ " if is_long_lead(p.get("leadTime")) else "") + (p.get("leadTime") or "—"),
                "≥300°C": "✓" if p.get("tempRated300") else "—",
                "Category": p.get("category"),
                "_id": p.get("id"),
            } for p in filtered])

            selection = st.dataframe(
                df.drop(columns=["_id"]),
                width="stretch",
                hide_index=True,
                height=420,
                on_select="rerun",
                selection_mode="single-row",
                key=f"parts_table_{cat}",
            )

            st.caption(f"Showing {len(filtered)} of {total_parts} parts"
                       + (f" · Temp filter ≥{min_temp}°C" if min_temp > 0 else "")
                       + " · Click a row for detail")

            selected_rows = selection.selection.rows if hasattr(selection, "selection") else []
            if selected_rows:
                sel_id = int(df.iloc[selected_rows[0]]["_id"])
                sel = next((p for p in filtered if p.get("id") == sel_id), None)
                if sel:
                    with st.container(border=True):
                        c1, c2 = st.columns([2, 1])
                        with c1:
                            st.markdown(f"### {sel.get('partNumber')}")
                            st.caption(f"{sel.get('quoteRef')} · {sel.get('date')}")
                            st.write(sel.get("description"))
                            kv = {
                                "Manufacturer": sel.get("manufacturer"),
                                "Vendor": sel.get("vendor"),
                                "Material": sel.get("material"),
                                "Connection": sel.get("connection"),
                                "Unit Price": fmt_price(sel.get("unitPrice"), sel.get("currency")),
                                "Lead Time": sel.get("leadTime"),
                                "Temp rating": f"{sel.get('tempRatingC')} °C" if sel.get("tempRatingC") else "—",
                                "Pressure": f"{sel.get('pressureRatingBar')} bar" if sel.get("pressureRatingBar") else "—",
                                "≥300°C": "Yes" if sel.get("tempRated300") else "No",
                                "Category": sel.get("category"),
                            }
                            st.dataframe(pd.DataFrame(kv.items(), columns=["Field", "Value"]),
                                         hide_index=True, width="stretch")
                            if sel.get("catalogLink"):
                                st.markdown(f"[📘 Catalog]({sel['catalogLink']})")
                        with c2:
                            alt = MARKET_MAP.get(sel.get("partNumber"))
                            if alt:
                                st.markdown("#### Market alternatives")
                                st.caption(f"Type: {alt.get('partType')}  ·  Standard: {alt.get('standard')}")
                                st.dataframe(pd.DataFrame(alt["alternatives"]),
                                             hide_index=True, width="stretch")
                                if alt.get("notes"):
                                    st.caption(f"ℹ {alt['notes']}")
                            else:
                                st.info("No market comparison available for this part.")


# ─────── DOCUMENTS TAB ───────
with tab_docs:
    if not documents:
        st.info("No documents yet. Upload a quote to create entries here.")
    else:
        df = pd.DataFrame(documents)
        st.dataframe(
            df,
            width="stretch",
            hide_index=True,
            column_config={
                "pdfLink": st.column_config.LinkColumn("PDF", display_text="Open ↗"),
                "catalogLink": st.column_config.LinkColumn("Catalog", display_text="Open ↗"),
            },
        )


# ─────── MAINTENANCE TAB ───────
with tab_maint:
    if not maint_items:
        st.success("All parts have complete catalog and vendor info. 🎉")
    else:
        st.warning(f"{len(maint_items)} parts need attention.")
        st.dataframe(pd.DataFrame(maint_items), width="stretch", hide_index=True)


# ──────────────────────────────── footer ────────────────────────────────
st.divider()
fc1, fc2 = st.columns(2)
with fc1:
    st.caption(f"Google Sheet: [open ↗](https://docs.google.com/spreadsheets/d/"
               f"{st.secrets['procurement_spreadsheet_id']}/edit)")
with fc2:
    if st.button("Refresh from sheet"):
        load_data.clear()
        st.rerun()
