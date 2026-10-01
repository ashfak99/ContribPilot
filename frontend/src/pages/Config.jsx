import { useState } from "react";
import {
  Eye,
  EyeOff,
  Code,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import {
  saveGithubToken,
  saveLlmKey,
  getGithubToken,
  getLlmKey,
} from "../utils/sessions.js";

export default function Config() {
  const [githubToken, setGithubToken] = useState("");
  const [llmKey, setLlmKey] = useState("");

  const [showGithub, setShowGithub] = useState(false);
  const [showLlm, setShowLlm] = useState(false);

  const [savedGithub, setSavedGithub] = useState(false);
  const [savedLlm, setSavedLlm] = useState(false);

  const [hasGithub, setHasGithub] = useState(
    () => Boolean(getGithubToken())
  );

  const [hasLlm, setHasLlm] = useState(
    () => Boolean(getLlmKey())
  );

  const handleSaveGithub = () => {
    if (!githubToken.trim()) return;

    saveGithubToken(githubToken.trim());

    setGithubToken("");
    setHasGithub(true);

    setSavedGithub(true);

    setTimeout(() => {
      setSavedGithub(false);
    }, 2000);
  };

  const handleSaveLlm = () => {
    if (!llmKey.trim()) return;

    saveLlmKey(llmKey.trim());

    setLlmKey("");
    setHasLlm(true);

    setSavedLlm(true);

    setTimeout(() => {
      setSavedLlm(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <Code size={24} className="text-cyan-400" />
            </div>

            <h1 className="text-3xl font-bold">
              Configuration
            </h1>
          </div>

          <p className="text-slate-400">
            Configure your GitHub and Groq credentials for ContribPilot.
          </p>
        </div>

        {/* GitHub Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-slate-800">
              <Code size={20} className="text-cyan-400" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                GitHub Configuration
              </h2>

              <p className="text-sm text-slate-500">
                Configure GitHub access for repository and issue data.
              </p>
            </div>
          </div>

          <label className="block text-sm font-medium text-slate-300 mb-2">
            Personal Access Token
          </label>

          <div className="relative">
            <input
              type={showGithub ? "text" : "password"}
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder={
                hasGithub
                  ? "Token already saved — enter new token to replace"
                  : "github_pat_..."
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-slate-600 outline-none focus:border-cyan-500 transition"
            />

            <button
              type="button"
              onClick={() => setShowGithub((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              aria-label={
                showGithub
                  ? "Hide GitHub token"
                  : "Show GitHub token"
              }
            >
              {showGithub ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          <p className="text-sm text-slate-400 mt-3 leading-6">
            Optional. Without a token, GitHub rate limits hit quickly and
            private repos won't work.

            {hasGithub && (
              <span className="text-green-400">
                {" "}
                · Already saved
              </span>
            )}
          </p>

          <button
            type="button"
            onClick={handleSaveGithub}
            disabled={!githubToken.trim()}
            className="mt-5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-semibold transition flex items-center gap-2"
          >
            {savedGithub ? (
              <>
                <CheckCircle2 size={18} />
                Saved
              </>
            ) : (
              "Save GitHub Token"
            )}
          </button>
        </div>

        {/* Groq Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-slate-800">
              <Sparkles size={20} className="text-purple-400" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                AI Configuration
              </h2>

              <p className="text-sm text-slate-500">
                Configure Groq for AI-powered contribution assistance.
              </p>
            </div>
          </div>

          <label className="block text-sm font-medium text-slate-300 mb-2">
            Groq API Key
          </label>

          <div className="relative">
            <input
              type={showLlm ? "text" : "password"}
              value={llmKey}
              onChange={(e) => setLlmKey(e.target.value)}
              placeholder={
                hasLlm
                  ? "API key already saved — enter new key to replace"
                  : "gsk_..."
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-slate-600 outline-none focus:border-purple-500 transition"
            />

            <button
              type="button"
              onClick={() => setShowLlm((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              aria-label={
                showLlm
                  ? "Hide Groq API key"
                  : "Show Groq API key"
              }
            >
              {showLlm ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          <p className="text-sm text-slate-400 mt-3 leading-6">
            Required for AI-powered issue analysis, breakdowns, and hints.

            {hasLlm && (
              <span className="text-green-400">
                {" "}
                · Already saved
              </span>
            )}
          </p>

          <button
            type="button"
            onClick={handleSaveLlm}
            disabled={!llmKey.trim()}
            className="mt-5 px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold transition flex items-center gap-2"
          >
            {savedLlm ? (
              <>
                <CheckCircle2 size={18} />
                Saved
              </>
            ) : (
              "Save Groq API Key"
            )}
          </button>
        </div>

        {/* Status */}
        <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                hasLlm
                  ? "bg-green-400"
                  : "bg-red-400"
              }`}
            />

            <span className="text-sm text-slate-300">
              {hasLlm
                ? "Groq API key configured. You can use AI features."
                : "Groq API key is required before using AI features."}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                hasGithub
                  ? "bg-green-400"
                  : "bg-yellow-400"
              }`}
            />

            <span className="text-sm text-slate-300">
              {hasGithub
                ? "GitHub token configured."
                : "GitHub token not configured. Public repositories can still be used with rate limits."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}