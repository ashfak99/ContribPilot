<div align="center">

# 🧭 ContribPilot

**AI-powered GitHub contribution assistant.**
Find issues that fit your skills, understand the codebase, and get guided hints without being handed the answer.

![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-build-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-backend-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![Groq](https://img.shields.io/badge/LLM-Groq-F55036)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

</div>

---

## Table of Contents

- [The Problem](#the-problem)
- [What ContribPilot Does](#what-contribpilot-does)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Bring Your Own Key (BYOK)](#bring-your-own-key-byok)
- [API Overview](#api-overview)
- [How Matching Works](#how-matching-works)
- [Known Limitations](#known-limitations)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## The Problem

Contributing to open source is hard to start. A new contributor has to:

- scroll through hundreds of issues to find one that fits their skills,
- figure out which files and functions matter in an unfamiliar codebase,
- and get stuck with no way to ask for help without spoiling the solution.

ContribPilot removes these three barriers.

## What ContribPilot Does

| | Feature | Description |
|---|---|---|
| 🔍 | **Issue Matchmaker** | Ranks a repository's open issues against your skills and experience level |
| 📊 | **Match Scoring** | A clear score and AI reasoning for how well each issue fits you |
| 🧩 | **AI Issue Breakdown** | Problem summary, files to inspect, relevant symbols and investigation steps, grounded in the real repository |
| 💡 | **Guided Hints** | Three progressive hint levels: where to look, what is wrong, how to fix |
| 🔑 | **Bring Your Own Key** | You use your own Groq key and GitHub token. Nothing is stored on the server |

## How It Works

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Repository │ →  │   Skills    │ →  │ Find Issues │ →  │   Match     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                │
                                                                ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Hints     │ ←  │  Breakdown  │ ←  │Issue Details│ ←  │Select Issue │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

1. Enter a repository (`owner/repo`), your skills and your experience level.
2. ContribPilot fetches open issues and ranks them by match score.
3. Open an issue to see an AI breakdown built from the repository's real files.
4. Ask for hints level by level when you get stuck.

### Architecture

```
┌──────────────────────┐        headers: X-Groq-Api-Key, X-GitHub-Token
│  Frontend (React)    │ ─────────────────────────────────────────────┐
│  keys in localStorage│                                              ▼
└──────────────────────┘                                  ┌────────────────────────┐
                                                          │   Backend (FastAPI)    │
                                                          │  ranking · breakdown   │
                                                          │  hints · caching       │
                                                          └───────────┬────────────┘
                                                                      │
                                              ┌───────────────────────┴───────────────────────┐
                                              ▼                                               ▼
                                     ┌─────────────────┐                             ┌─────────────────┐
                                     │  GitHub REST API│                             │   Groq LLM API  │
                                     │ issues, tree,   │                             │ scoring,        │
                                     │ file contents   │                             │ breakdown, hints│
                                     └─────────────────┘                             └─────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18+, Vite, Tailwind CSS, React Router v6, Framer Motion, Lucide React |
| Backend | Python 3.11+, FastAPI, Uvicorn, Pydantic, httpx |
| AI | Groq chat completions (LLM model configurable) |
| Data source | GitHub REST API |

## Repository Structure

```
contribpilot/
├── frontend/          # React + Vite app            → see frontend/README.md
│   └── src/
│       ├── components/    # IssueCard, HintCard, Navbar
│       ├── pages/         # Home, Matchmaker, IssueDetails, Config, Docs
│       └── services/      # API client
│
├── backend/           # FastAPI service             → see backend/README.md
│   └── app/
│       ├── api/           # routers: issues, contributions
│       ├── ai/            # ranking, breakdown, hints, prompts
│       ├── core/          # config, per-request credentials
│       ├── services/      # ai_service, github_service
│       └── schemas/       # request and response models
│
└── README.md          # you are here
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- A [Groq API key](https://console.groq.com/keys)
- (Recommended) A [GitHub personal access token](https://github.com/settings/tokens). Public repositories need no special scopes, and `repo` is only needed for private repositories.

### 1. Clone

```bash
git clone https://github.com/your-username/contribpilot.git
cd contribpilot
```

### 2. Start the backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install fastapi "uvicorn[standard]" groq httpx python-dotenv pydantic
```

If the backend has a `requirements.txt`, use `pip install -r requirements.txt` instead.

Create `backend/.env`:

```env
LLM_API_KEY=your_groq_api_key
LLM_API_MODEL=your_groq_model_name
GITHUB_TOKEN=your_github_token
FRONTEND_ORIGIN=http://localhost:5173
ALLOW_SERVER_KEY_FALLBACK=true
```

Run it:

```bash
uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000` (interactive docs at `/docs`).

### 3. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Open `http://localhost:5173`.

### 4. Add your keys

Open the **Configuration** page (`/config`) and enter your Groq API key and, optionally, your GitHub token. Then enter a repository such as `owner/repo`, your skills and your level, and click **Find Issue**.

> If you set `ALLOW_SERVER_KEY_FALLBACK=true` in the backend `.env`, the app also works without entering keys in the UI. It then uses the server's keys.

## Bring Your Own Key (BYOK)

ContribPilot is built so that users bring their own credentials.

- The frontend stores keys in the browser's `localStorage` and never displays them after saving.
- Each request sends them as headers: `X-Groq-Api-Key` and `X-GitHub-Token`.
- The backend uses them for that single request only. Keys are never stored or logged.
- Without a Groq key (and without server fallback), the API returns `401`.
- Cached data is scoped per GitHub token, so private repository data is never shared between users.

For production, serve everything over HTTPS and set `ALLOW_SERVER_KEY_FALLBACK=false` for strict BYOK.

## API Overview

| Endpoint | Method | Description |
|---|---|---|
| `/health` | `GET` | Service health check |
| `/api/issues/recommend` | `POST` | Rank a repository's open issues for a profile |
| `/api/issues/{id}/breakdown` | `POST` | AI breakdown of one issue |
| `/api/contributions/hint` | `POST` | Progressive hint (levels 1 to 3) |

Example:

```bash
curl -X POST http://localhost:8000/api/issues/recommend \
  -H "Content-Type: application/json" \
  -H "X-Groq-Api-Key: YOUR_GROQ_KEY" \
  -H "X-GitHub-Token: YOUR_GITHUB_TOKEN" \
  -d '{"repo":"owner/repo","skills":["python","git"],"experience":"beginner","limit":10}'
```

Full request and response details, error codes and caching are in the [backend README](backend/README.md).

## How Matching Works

The LLM scores each issue on three parts, and the backend adds them up so the total always matches the reasoning:

| Sub-score | Range | Meaning |
|---|---|---|
| Skill | 0 to 50 | How many of the required technologies you know |
| Experience | 0 to 30 | How well the issue's complexity fits your level |
| Task | 0 to 20 | Whether it is a real, actionable contribution task |

Non-contribution issues (invitations, questions, announcements) are capped at a low score so they sink to the bottom.

Breakdowns are grounded: files and symbols suggested by the AI are checked against the repository's real file tree and fetched source code, and unknown ones are dropped. Level 1 and 2 hints are validated so they do not leak code or exact fixes.

## Known Limitations

- **Rate limits:** free-tier Groq keys have per-minute request and token limits, and unauthenticated GitHub access is limited to 60 requests per hour. Use your own tokens for smoother results.
- **In-memory caching:** caches reset when the backend restarts.
- **Context size:** breakdowns use a limited number of relevant files per issue, so very large repositories may produce a partial context. The response reports this in `context_status`.
- **Code-focused:** file selection currently targets common source files (Python, JavaScript, TypeScript and a few config formats).

## Documentation

| Document | Contents |
|---|---|
| [Backend README](backend/README.md) | Setup, environment variables, API reference, scoring, caching, troubleshooting |
| [Frontend README](frontend/README.md) | Setup, configuration page, components, design system |

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

- [Groq](https://groq.com/) for fast LLM inference
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [Lucide](https://lucide.dev/) for the icon set
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for fast builds

---

<p align="center">
  <strong>ContribPilot</strong> — Navigate open source with confidence.
</p>