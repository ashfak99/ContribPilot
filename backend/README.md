# ContribPilot Backend

AI-powered GitHub contribution assistant. Given a repository and a developer's skills, ContribPilot:

1. **Recommends** open issues ranked by how well they match the developer (match score, complexity, beginner-friendliness).
2. **Breaks down** an issue into a problem summary, files to inspect, relevant symbols and investigation steps.
3. **Gives progressive hints** (3 levels: where to look, what is wrong, how to fix) without spoiling the solution.

The backend is built with **FastAPI** and uses **Groq** for LLM calls and the **GitHub REST API** for issue and repository data.

---

## Features

- **Bring Your Own Key (BYOK):** users send their own Groq key and GitHub token per request. Nothing is stored on the server.
- **Batched ranking:** issues are scored in batches (5 per LLM call) with retry, partial-JSON salvage and fallback results.
- **Deterministic scoring:** the LLM returns sub-scores and the backend computes the final `match_score`.
- **Grounded breakdowns:** files and symbols suggested by the LLM are validated against the real repository tree and fetched source code.
- **Hint guardrails:** level 1 and 2 hints are checked so they do not leak code or exact fixes.
- **Caching:** GitHub responses and AI results are cached in memory (scoped per GitHub token).
- **Resilience:** retry with backoff for GitHub errors, rate limit handling, and clear error messages for invalid keys.

---

## Tech Stack

| Area | Technology |
|---|---|
| API framework | FastAPI, Uvicorn |
| LLM provider | Groq (OpenAI-compatible chat completions) |
| GitHub access | GitHub REST API via `httpx` |
| Config | `python-dotenv` |
| Validation | Pydantic |
| Language | Python 3.11+ |

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app, CORS, routers, exception handlers
│   ├── api/
│   │   ├── issues.py            # /recommend and /{issue_id}/breakdown
│   │   └── contributions.py     # /hint
│   ├── ai/
│   │   ├── llm_client.py        # Groq client factory, error types, JSON-mode fallback
│   │   ├── ranking.py           # batched issue ranking and score validation
│   │   ├── breakdown.py         # issue breakdown generation and validation
│   │   ├── hints.py             # 3-level hint generation and guardrails
│   │   └── prompts/
│   │       ├── ranking.txt
│   │       ├── breakdown.txt
│   │       └── hint_1.txt, hint_2.txt, hint_3.txt
│   ├── core/
│   │   ├── config.py            # environment settings
│   │   └── credentials.py       # per-request BYOK credentials dependency
│   ├── services/
│   │   ├── ai_service.py        # orchestration, repository context, caching
│   │   └── github_service.py    # GitHub API client with retry and caching
│   └── schemas/
│       ├── ai.py                # RankingResponse, BreakdownResponse, HintResponse
│       └── request.py           # request and wrapper models
└── .env                         # local environment variables (not committed)
```

---

## Getting Started

### 1. Prerequisites

- Python 3.11 or newer
- A [Groq API key](https://console.groq.com/keys)
- (Recommended) A GitHub personal access token. Public repositories need no special scopes.

### 2. Install

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install fastapi "uvicorn[standard]" groq httpx python-dotenv pydantic
```

If the project has a `requirements.txt`, use `pip install -r requirements.txt` instead.

### 3. Configure environment

Create a `.env` file in `backend/`:

```env
LLM_API_KEY=your_groq_api_key
LLM_API_MODEL=your_groq_model_name
GITHUB_TOKEN=your_github_token
FRONTEND_ORIGIN=http://localhost:5173
ALLOW_SERVER_KEY_FALLBACK=true
E2B_API_KEY=
```

| Variable | Required | Description |
|---|---|---|
| `LLM_API_KEY` | Only if fallback is enabled | Server-side Groq key, used when the client sends no key |
| `LLM_API_MODEL` | Yes | Groq model name used for all LLM calls |
| `GITHUB_TOKEN` | No | Server-side GitHub token fallback. Without any token, GitHub allows only 60 requests/hour |
| `FRONTEND_ORIGIN` | No | Allowed CORS origin (default `http://localhost:5173`) |
| `ALLOW_SERVER_KEY_FALLBACK` | No | `true` (default): use the `.env` keys when a request has no key. `false`: strict BYOK, requests without a key get `401` |
| `E2B_API_KEY` | No | Only needed for E2B sandbox features |

### 4. Run

```bash
uvicorn app.main:app --reload --port 8000
```

- API: `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

> Prompts are cached in memory. Restart the server after editing any file in `app/ai/prompts/`.

---

## Authentication (BYOK)

Keys are sent as request headers on every AI endpoint:

| Header | Description |
|---|---|
| `X-Groq-Api-Key` | The user's Groq API key |
| `X-GitHub-Token` | The user's GitHub token (optional, raises GitHub rate limits and allows private repos) |

How keys are resolved for each request:

1. Use the header value if present.
2. Otherwise, use the `.env` value, only if `ALLOW_SERVER_KEY_FALLBACK=true`.
3. If no Groq key is found, the API returns `401`.

Keys are never stored or logged. Use HTTPS in production, because headers carry the keys.

---

## API Reference

Base URL: `http://localhost:8000`

### `GET /health`

Returns service status.

```json
{ "status": "ok", "service": "ContribPilot API" }
```

### `POST /api/issues/recommend`

Fetches open issues from a repository and ranks them for the given profile.

**Request body**

```json
{
  "repo": "owner/repo",
  "skills": ["python", "fastapi"],
  "experience": "beginner",
  "limit": 10
}
```

**Example**

```bash
curl -X POST http://localhost:8000/api/issues/recommend \
  -H "Content-Type: application/json" \
  -H "X-Groq-Api-Key: YOUR_GROQ_KEY" \
  -H "X-GitHub-Token: YOUR_GITHUB_TOKEN" \
  -d '{"repo":"owner/repo","skills":["javascript","node.js"],"experience":"beginner","limit":10}'
```

**Response**

```json
{
  "issues": [
    {
      "issue_id": 667,
      "match_score": 62,
      "complexity_level": "intermediate",
      "is_beginner_friendly": false,
      "required_technologies": ["javascript", "css"],
      "matching_skills": ["javascript"],
      "missing_or_mismatched_skills": ["css"],
      "reasoning": "Needs frontend styling work beyond the user's listed skills."
    }
  ],
  "total": 1,
  "repo": "owner/repo"
}
```

Issues are returned sorted by `match_score` (highest first). Issues with the `good-first-issue` or `bug` label are tried first, and all open issues are used as a fallback.

### `POST /api/issues/{issue_id}/breakdown`

Generates a structured breakdown for one issue using the repository's tree and relevant source files.

**Request body**

```json
{
  "repo": "owner/repo",
  "skills": ["python"],
  "experience": "intermediate"
}
```

**Response (wrapped)**

```json
{
  "issue_id": 2421,
  "repo": "owner/repo",
  "breakdown": {
    "problem_summary": "...",
    "expected_behavior": "...",
    "current_behavior": "...",
    "confirmed_facts": ["..."],
    "files_to_inspect": ["backend/services/llm_providers.py"],
    "relevant_symbols": ["LLMProviderRegistry"],
    "concepts_to_understand": ["..."],
    "investigation_steps": ["..."],
    "verification_target": "...",
    "context_status": "sufficient"
  }
}
```

### `POST /api/contributions/hint`

Returns a progressive hint. Levels must be requested in order (1, then 2, then 3).

**Request body**

```json
{
  "level": 1,
  "issue_context": {
    "issue": { "title": "...", "body": "...", "labels": ["bug"] },
    "repository": {
      "name": "repo",
      "primary_language": "Python",
      "relevant_files": ["app/main.py"],
      "relevant_symbols": ["create_app"]
    }
  },
  "current_progress": {
    "hint_levels_shown": [],
    "previous_hints": {}
  }
}
```

| Level | Purpose |
|---|---|
| 1 | Where to look. No code, no bug explanation |
| 2 | What behavior is wrong. No patch |
| 3 | How to fix. Minimal code is allowed |

**Response**

```json
{ "level": 1, "hint_text": "..." }
```

---

## How Scoring Works

The LLM returns three sub-scores per issue, and the backend adds them up:

| Sub-score | Range | Meaning |
|---|---|---|
| `skill_score` | 0 to 50 | How many required technologies the user has |
| `experience_score` | 0 to 30 | How well the issue's complexity fits the user's level |
| `task_score` | 0 to 20 | Whether it is a real, actionable contribution task |

`match_score = skill_score + experience_score + task_score`. If `task_score` is 0 (invitations, questions, announcements), the total is capped at 15 so such issues sink to the bottom.

If the LLM fails to rank an issue after retries, a fallback result with `match_score: 0` is returned and the response is not cached.

---

## Error Responses

| Status | When | Body |
|---|---|---|
| `400` | Invalid repo format, no skills, invalid hint level order | `{"detail": "..."}` |
| `401` | Groq key missing or invalid | `{"error": "InvalidLLMKey", "message": "..."}` |
| `401` | GitHub token invalid | `{"detail": "Invalid GitHub token. ..."}` |
| `404` | Repository or issue not found | `{"detail": "..."}` |
| `422` | Request validation error | `{"error": "ValidationError", "details": [...]}` |
| `429` | Groq rate limit | `{"error": "LLMRateLimited", "message": "..."}` |
| `429` | GitHub rate limit | `{"detail": "..."}` |
| `502` | Upstream (GitHub or LLM) failure | `{"detail": "..."}` |
| `500` | Unexpected server error | `{"error": "InternalServerError", ...}` |

Clients should read the message as `body.message ?? body.detail`.

---

## Caching

| Cache | TTL | Notes |
|---|---|---|
| Ranking results | 1 hour | Key: repo, skills, experience, token scope. Not cached if any issue used the fallback |
| Breakdown results | 1 hour | Key: repo, issue id, experience, token scope |
| GitHub repo info | 1 hour | |
| GitHub file tree | 30 minutes | |
| GitHub file content | 15 minutes | |
| GitHub issue | 5 minutes | |

Caches live in process memory and reset on restart. They are scoped by a hash of the GitHub token, so private repository data is never shared between users.

---

## Troubleshooting

**`401 InvalidLLMKey`**
The Groq key is missing or wrong. Check the `X-Groq-Api-Key` header, or the `.env` value if you rely on the server fallback.

**`429` from Groq**
You hit the Groq rate limit (requests or tokens per minute). Wait a moment, reduce `BATCH_SIZE` in `ai/ranking.py`, or use a model with higher limits.

**`json_validate_failed` in logs**
Groq's JSON mode rejected the output. The client automatically retries once without `response_format`, and the JSON parser handles the result.

**All scores are `0` with "AI ranking unavailable"**
Every ranking batch failed and fallback results were used. Check the logs for the underlying Groq error.

**GitHub rate limit exceeded**
Add a GitHub token (header or `.env`). Unauthenticated requests are limited to 60 per hour.

**Changed a prompt but nothing changed**
Prompts are cached in memory. Restart the server. Ranking and breakdown results are also cached for 1 hour per input.

---

## Security Notes

- API keys are read per request and are never written to disk or logs.
- Run behind HTTPS in production.
- Keep `ALLOW_SERVER_KEY_FALLBACK=false` in production if you want strict BYOK.
- Restrict `FRONTEND_ORIGIN` to your real frontend domain.

---

## License

Add your license here.