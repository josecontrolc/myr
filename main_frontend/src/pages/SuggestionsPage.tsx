import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@shared/auth";
import { postJson } from "../api/client";

const REQUEST_TYPES = [
  "pages.suggestions.types.improvement",
  "pages.suggestions.types.featureRequest",
  "pages.suggestions.types.technicalIssue",
  "pages.suggestions.types.generalQuestion",
  "pages.suggestions.types.other",
] as const;

interface SuggestionPayload {
  type: string;
  subject: string;
  message: string;
}

const DiamondIcon = () => (
  <svg
    className="w-6 h-6 text-pink-400 shrink-0"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2l3.5 6.5L22 10l-5 5 1.5 7L12 18.5 5.5 22 7 15 2 10l6.5-1.5L12 2z" />
  </svg>
);

const SendIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const SuggestionsPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const [type, setType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
        <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
          {t("placeholders.loading")}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !subject.trim() || !message.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await postJson<SuggestionPayload, unknown>("/suggestions", {
        type,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
    } catch {
      setError(t("pages.suggestions.errorMessage"));
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    "w-full rounded-lg px-4 py-3 text-sm outline-none transition-all duration-150 " +
    "bg-white/10 border border-white/20 text-white placeholder-white/40 " +
    "focus:border-pink-400/60 focus:ring-2 focus:ring-pink-400/20 focus:bg-white/15";

  return (
    <div
      className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, #6b21a8 0%, #4c1d95 40%, #2d1458 100%)",
      }}
    >
      <div className="w-full max-w-xl">
        {submitted ? (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="flex justify-center">
              <span className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-pink-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {t("pages.suggestions.successTitle")}
            </h2>
            <p className="text-white/70 text-sm">
              {t("pages.suggestions.successMessage")}
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setType("");
                setSubject("");
                setMessage("");
              }}
              className="mt-4 px-6 py-2.5 rounded-full text-sm font-semibold bg-pink-500 hover:bg-pink-600 text-white transition-colors"
            >
              {t("pages.suggestions.sendAnother")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="text-center space-y-3 mb-2">
              <div className="flex items-center justify-center gap-3">
                <h1 className="text-2xl font-bold text-white">
                  {t("pages.suggestions.title")}
                </h1>
                <DiamondIcon />
              </div>
              <p className="text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                {t("pages.suggestions.subtitle")}
              </p>
            </div>

            {/* Form card */}
            <div
              className="rounded-2xl p-6 space-y-4"
              style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              {/* Type select */}
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  className={`${inputBase} appearance-none pr-10 cursor-pointer`}
                  style={{ colorScheme: "dark" }}
                >
                  <option value="" disabled className="bg-purple-900 text-white/60">
                    {t("pages.suggestions.typePlaceholder")}
                  </option>
                  {REQUEST_TYPES.map((key) => (
                    <option key={key} value={key} className="bg-purple-900 text-white">
                      {t(key)}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>

              {/* Subject */}
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("pages.suggestions.subjectPlaceholder")}
                required
                maxLength={200}
                className={inputBase}
              />

              {/* Message */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("pages.suggestions.messagePlaceholder")}
                required
                rows={6}
                maxLength={2000}
                className={`${inputBase} resize-none`}
              />

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              {/* Submit inside card */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={submitting || !type || !subject.trim() || !message.trim()}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest bg-pink-500 hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all duration-150 shadow-lg shadow-pink-500/40"
                >
                  <SendIcon />
                  {submitting ? t("pages.suggestions.sending") : t("pages.suggestions.send")}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SuggestionsPage;
