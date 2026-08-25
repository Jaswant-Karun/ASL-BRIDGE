# Optional n8n Workflows

n8n is not required to run ASL Bridge. The backend's local translation and ML gesture pipeline is the default and does not need n8n, Gemini, or an API key. Use these workflows only when an external automation layer is deliberately enabled.

Import the workflow JSON files into n8n and configure credentials through n8n's credential manager. Never commit secrets.

## Local setup

1. Start the backend with `npm run dev --prefix backend`.
2. Copy `.env.example` to the n8n environment and set `BACKEND_API_URL` and `GEMINI_API_KEY`.
3. Import `workflows/text-to-asl.json` into n8n.
4. Activate the workflow and set `N8N_ENABLED=true` plus `N8N_WEBHOOK_URL` in `backend/.env` only if you intentionally want n8n to override local gloss generation.
5. Restart the backend, then use the frontend text translation screen.

The text workflow receives `{ "text": "..." }`, asks Gemini for an uppercase ASL-oriented gloss, calls `POST /api/asl/map`, and returns `gloss`, `animations`, and `unsupported`. The backend remains the single source of truth for sign mappings.

## Run n8n with Docker (optional)

1. Copy `.env.example` to `.env` inside this directory and set `GEMINI_API_KEY`.
2. Start n8n with `docker compose up -d`.
3. Open `http://localhost:5678` and create the local owner account.
4. Import `workflows/text-to-asl.json` from the Workflows menu.
5. Activate the workflow and set the backend `N8N_WEBHOOK_URL` to `http://localhost:5678/webhook/asl/text`.

The compose file uses `host.docker.internal` so a containerized n8n instance can reach the local backend on Windows. For deployed n8n, set `BACKEND_API_URL` to the public HTTPS backend URL instead.

For the speech workflow, send `{ "text": "..." }` or `{ "transcript": "..." }` to the activated `asl/speech` webhook. Speech-to-text can be inserted before the existing transcript preparation node when an STT provider is configured.
