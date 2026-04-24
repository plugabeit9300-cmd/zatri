# ISI Procurement Dashboard

Internal Streamlit app for ~3 engineers. Upload vendor PDF quotes → Claude
Code CLI extracts line items → data persists in a Google Sheet.

## Stack

- **Streamlit** — UI
- **Google Sheets** via `gspread` + service account — source of truth
- **Claude Code CLI** (`claude -p`) authenticated with `CLAUDE_CODE_OAUTH_TOKEN` — no Anthropic API key needed
- **Node.js** — only because `claude` is an npm package

## Repo layout

```
app.py                       Main Streamlit app
sheets.py                    gspread layer (read/append/seed)
claude_parse.py              Subprocess wrapper around `claude -p` + validation
bootstrap.py                 Installs claude CLI at runtime if missing
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

- Uploaded PDFs live in `/tmp` only during parsing and are deleted right after.
- Market-alternatives data (`MARKET_MAP`) currently comes from `seed.json`, not the sheet. Move it to a worksheet when you want to edit it from the UI.
- `claude -p` is invoked with `--allowed-tools Read` so it cannot write files, run shell commands, or hit the network during extraction.
