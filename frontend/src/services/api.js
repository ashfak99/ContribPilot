// ---------- Session / Credentials ----------

import {
  getGithubToken,
  getLlmKey,
} from "../utils/sessions.js";

// ---------- Env-based base URL ----------

const API_BASE = import.meta.env.VITE_API_URL || "";

// ---------- Endpoint registry ----------

// NOTE: /api/issues (plural) — matching FastAPI router prefix
const ENDPOINTS = {
  recommend: "/api/issues/recommend",
  breakdown: (id) => `/api/issues/${id}/breakdown`,
  hint: "/api/contributions/hint",
};

// ---------- Headers ----------

function getHeaders() {
  const githubToken = getGithubToken();
  const llmKey = getLlmKey();

  return {
    "Content-Type": "application/json",

    ...(githubToken
      ? {
          "X-Github-Token": githubToken,
        }
      : {}),

    ...(llmKey
      ? {
          "X-Groq-Api-Key": llmKey,
        }
      : {}),
  };
}

// ---------- Generic request ----------

async function request(path, body) {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let message = "";

    try {
      const j = await res.json();

      // HTTPException → { detail: "..." }
      // Custom handlers → { error: "...", message: "..." }
      // ValidationError → { error, message, details: [...] }
      // Pydantic default → { detail: [{...}] }

      message =
        (typeof j.detail === "string" && j.detail) ||
        j.message ||
        j.error ||
        (Array.isArray(j.detail) &&
          j.detail
            .map((d) => d.msg || d.message)
            .filter(Boolean)
            .join(", ")) ||
        "";
    } catch {
      // non-JSON body
    }

    throw new Error(
      message || `Request failed (${res.status})`
    );
  }

  return res.json();
}

// ---------- Public API ----------

// STEP 1: Find matching issues

export function findIssues({
  skills,
  experience,
  repo,
  limit = 10,
}) {
  return request(ENDPOINTS.recommend, {
    skills,
    experience,
    repo,
    limit,
  });
}

// STEP 2: Get issue breakdown

export function getIssueBreakdown({
  issueId,
  repo,
  skills,
  experience,
}) {
  return request(ENDPOINTS.breakdown(issueId), {
    repo,
    skills,
    experience,
  });
}

// STEP 3: Get hint for a specific level

export function getHint({
  level,
  issue_context,
  current_progress,
}) {
  return request(ENDPOINTS.hint, {
    level,
    issue_context,
    current_progress,
  });
}