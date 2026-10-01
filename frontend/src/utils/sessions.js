const CRITERIA_KEY = "cp_match_criteria";
const ACTIVE_ISSUE_KEY = "active_issue_id";

const hintKey = (issueId) => `cp_hint_${issueId}`;

// ============================================================
// Match criteria
// ============================================================

export function saveMatchCriteria({ skills, experience, repo }) {
  try {
    localStorage.setItem(
      CRITERIA_KEY,
      JSON.stringify({
        skills,
        experience,
        repo,
      })
    );
  } catch {
    // ignore storage errors
  }
}

export function getMatchCriteria() {
  try {
    const raw = localStorage.getItem(CRITERIA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ============================================================
// Active issue
// ============================================================

export function setActiveIssueId(id) {
  try {
    localStorage.setItem(ACTIVE_ISSUE_KEY, String(id));
  } catch {
    // ignore storage errors
  }
}

export function getActiveIssueId() {
  try {
    return localStorage.getItem(ACTIVE_ISSUE_KEY);
  } catch {
    return null;
  }
}

// ============================================================
// Hint unlock progress
// ============================================================

export function getUnlockedHint(issueId) {
  try {
    return Number(localStorage.getItem(hintKey(issueId)) || 0);
  } catch {
    return 0;
  }
}

export function setUnlockedHint(issueId, level) {
  try {
    localStorage.setItem(hintKey(issueId), String(level));
  } catch {
    // ignore storage errors
  }
}

// ============================================================
// Credentials
// ============================================================

const GH_TOKEN_KEY = "gh_token";
const LLM_KEY = "llm_key";

// ---------- GitHub Token ----------

export function saveGithubToken(token) {
  try {
    sessionStorage.setItem(GH_TOKEN_KEY, token);
  } catch {
    // ignore storage errors
  }
}

export function getGithubToken() {
  try {
    return sessionStorage.getItem(GH_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

// ---------- Groq API Key ----------

export function saveLlmKey(key) {
  try {
    sessionStorage.setItem(LLM_KEY, key);
  } catch {
    // ignore storage errors
  }
}

export function getLlmKey() {
  try {
    return sessionStorage.getItem(LLM_KEY) || "";
  } catch {
    return "";
  }
}

// ============================================================
// Credential checks
// ============================================================

export function hasRequiredCredentials() {
  return Boolean(getLlmKey());
}

export function hasGithubToken() {
  return Boolean(getGithubToken());
}