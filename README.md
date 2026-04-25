# ISI Procurement Dashboard

Internal Streamlit app for ~3 engineers. Upload vendor PDF quotes → Claude
Code CLI extracts line items → data persists in a Google Sheet.

## Stack

- **Streamlit** — UI
- **Google Sheets** via `gspread` + service account — source of truth for parts/documents/vendors
- **Google Drive** via `google-api-python-client` + same service account — archives the original PDFs
- **Claude Code CLI** (`claude -p`) authenticated with `CLAUDE_CODE_OAUTH_TOKEN` — no Anthropic API key needed
- **Node.js** — only because `claude` is an npm package

## Repo layout

```
app.py                       Main Streamlit app
sheets.py                    gspread layer (read/append/seed)
drive.py                     Drive upload (PDF archive)
claude_parse.py              Subprocess wrapper around `claude -p` + validation + preflight + on_tick heartbeat
bootstrap.py                 Installs claude CLI at runtime if missing (no-op on hosts where it's pre-installed)
data/seed.json               Initial 97 parts / 9 docs / 4 vendors / 6 market comps
.streamlit/secrets.toml      NOT committed — local secrets
.streamlit/config.toml       Dark theme
packages.txt                 apt packages for Streamlit Cloud (nodejs, npm)
requirements.txt             Python deps
setup.sh                     Local dev convenience
```

## Secrets

`.streamlit/secrets.toml` must contain:

| Key | How to get it |
|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | Run `claude setup-token` on a laptop already logged into Claude Code; copy the printed token. |
| `procurement_spreadsheet_id` | The ID from the Google Sheet URL. Already set to `16lHtt...nEM`. |
| `procurement_drive_folder_id` | The ID from the Drive folder URL where uploaded PDFs are archived. Currently `1LsTjFRc_iGze2QA5SL7ytA3YPDTrT3GN`. Folder must be shared (Editor) with the service account. |
| `app_password` | Pick any string; share out-of-band with the 3 engineers. Currently `" "` (one space). |
| `[gcp_service_account]` | Reused from `pluga_b/form1`. Service account: `from1-access@spherical-entry-477021-m5.iam.gserviceaccount.com` — must have Editor access on the sheet. |

## Running locally

```bash
cd /Users/bv/codeProjects/zatri
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
./setup.sh          # installs @anthropic-ai/claude-code if missing
streamlit run app.py
```

## Deploying to Streamlit Community Cloud

1. Push repo to GitHub (private).
2. Go to <https://share.streamlit.io/> → **New app** → pick the repo and `app.py`.
3. In the app's **Settings → Secrets**, paste the entire contents of your local `.streamlit/secrets.toml`.
4. Deploy. First boot runs `apt install nodejs npm` (packages.txt) then the app's `bootstrap.ensure_claude_cli()` npm-installs Claude Code CLI into `~/.local`. Takes ~1 min the first time; subsequent boots are instant.

### Keeping the URL private

- Streamlit Community Cloud can restrict access to specific Google accounts — enable in the app's **Sharing** settings and add the 3 engineers' Google emails. This replaces the `app_password` gate for production.

## Seeding

On first run against an empty spreadsheet, `sheets.seed_if_empty()` writes
the 97 parts / 9 documents / 4 vendors from `data/seed.json` into worksheets
named `parts`, `documents`, `vendors`. Idempotent — safe to run repeatedly.

## Rotating the Claude OAuth token

`claude setup-token` again on your laptop, paste new value into Streamlit
Cloud **Settings → Secrets**, app restarts.

## Notes

- During parsing, PDFs are written to `/tmp` and deleted right after the `claude -p` call returns.
- After a successful import, the original PDF is uploaded to the configured Drive folder; the resulting `webViewLink` is saved into the `documents` sheet's `pdfLink` column and shown as a clickable link in the Document Library tab.
- Market-alternatives data (`MARKET_MAP`) currently comes from `seed.json`, not the sheet. Move it to a worksheet when you want to edit it from the UI.
- `claude -p` is invoked with `--permission-mode bypassPermissions` and `stdin=DEVNULL`, plus `CI=1` and `TERM=dumb`, so it never blocks waiting for an interactive prompt.

## Possible future migration: GCP Cloud Run (free tier)

Streamlit Community Cloud is the simplest deploy and is fine for ~3 users.
If we ever need a more "serious" host (custom domain, no idle suspension,
team SSO via Google IAP, etc.), Cloud Run is the natural next step and is
also effectively free at our usage level.

### Why it works for us

- **Always-free quota:** 2,000,000 requests/month, 360,000 GB-seconds memory, 180,000 vCPU-seconds. We will not come close.
- **Scales to zero** when idle (no cost), cold-start ≈1–2 s on first request.
- **HTTPS URL by default** (`<service>-<hash>.a.run.app`); custom domain optional.
- **Same secrets and same service account** — no GCP-side rework.

### What we'd need to add

1. **`Dockerfile`** that:
   - Starts from `python:3.12-slim`
   - Installs `nodejs`, `npm` via apt
   - `npm install -g @anthropic-ai/claude-code`
   - `pip install -r requirements.txt`
   - Copies the app
   - Runs `streamlit run app.py --server.port=8080 --server.address=0.0.0.0` (Cloud Run requires listening on `$PORT`, default 8080)
2. **Deploy command** (one-shot):
   ```bash
   gcloud run deploy zatri \
     --source . \
     --region us-central1 \
     --project spherical-entry-477021-m5 \
     --allow-unauthenticated   # or --no-allow-unauthenticated + IAP for SSO
   ```
3. **Secrets**: instead of `.streamlit/secrets.toml`, mount via Secret Manager:
   ```bash
   gcloud run services update zatri \
     --update-secrets=CLAUDE_CODE_OAUTH_TOKEN=claude-token:latest,...
   ```
   Then read in `app.py` from `os.environ` first, falling back to `st.secrets` for local dev.
4. **Restrict access** (optional but recommended for an internal tool):
   - Disable `--allow-unauthenticated`
   - Enable Identity-Aware Proxy and add the 3 engineers' Google emails to the IAM role `roles/run.invoker`
   - This replaces the `app_password` gate with proper Google SSO.

### Things to watch out for

- **Cold start** of ~2 s — if a teammate hits the URL after 15 min of idle, first paint is slower. Acceptable for an internal tool.
- **Stateless filesystem** — same as Streamlit Cloud; we already write only to `/tmp` during parsing, so no change needed.
- **Bootstrap pattern can be simplified** — since the Dockerfile installs `claude` at build time (not at first request like in Streamlit Cloud), `bootstrap.ensure_claude_cli()` becomes a fast no-op on Cloud Run. Keep the function for local dev parity.
- **Memory**: default 512 MB is plenty; `claude -p` runs in a child process and does its work over the network.
- **CPU allocation**: keep "CPU is only allocated during request processing" (the cheaper default). If you ever notice slow streaming during long Claude calls, switch to "CPU always allocated" — but that uses more free-tier seconds.

### Migration checklist (when we decide to move)

- [ ] Add `Dockerfile`
- [ ] Move secrets into Secret Manager; tweak `app.py` to prefer env vars
- [ ] First `gcloud run deploy` from local
- [ ] Verify Sheets + Drive integration still works
- [ ] Set up Cloud Build trigger on `main` push so deploys are automatic
- [ ] (Optional) Enable IAP, add team emails, drop `app_password`
- [ ] (Optional) Map a custom subdomain
