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

const StarIcon = () => (
  <svg className="w-5 h-5 text-secondary shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        <p className="text-sm text-sec">{t("placeholders.loading")}</p>
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

  if (submitted) {
    return (
      <div className="bg-background dark:bg-background-dark min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
        <div className="card rounded-2xl p-10 max-w-md w-full text-center space-y-4">
          <span className="inline-flex w-14 h-14 rounded-full bg-secondary/10 items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <h2 className="text-xl font-bold text-textPrimary dark:text-white">
            {t("pages.suggestions.successTitle")}
          </h2>
          <p className="text-sm text-sec leading-relaxed">
            {t("pages.suggestions.successMessage")}
          </p>
          <button
            onClick={() => { setSubmitted(false); setType(""); setSubject(""); setMessage(""); }}
            className="btn-primary mt-2"
          >
            {t("pages.suggestions.sendAnother")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background dark:bg-background-dark min-h-[calc(100vh-3.5rem)] py-10">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Header */}
          <div className="card rounded-2xl px-8 py-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-xl font-bold text-textPrimary dark:text-white">
                {t("pages.suggestions.title")}
              </h1>
              <StarIcon />
            </div>
            <p className="text-sm text-sec leading-relaxed max-w-sm mx-auto">
              {t("pages.suggestions.subtitle")}
            </p>
          </div>

          {/* Form card */}
          <div className="card rounded-2xl p-6 space-y-4">

            {/* Type select */}
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="input appearance-none pr-10 cursor-pointer"
              >
                <option value="" disabled>
                  {t("pages.suggestions.typePlaceholder")}
                </option>
                {REQUEST_TYPES.map((key) => (
                  <option key={key} value={key}>
                    {t(key)}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary dark:text-textSecondary-dark">
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
              className="input"
            />

            {/* Message */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("pages.suggestions.messagePlaceholder")}
              required
              rows={6}
              maxLength={2000}
              className="input resize-none"
            />

            {error && (
              <p className="text-sm text-status-error dark:text-status-error-dark text-center">{error}</p>
            )}

            {/* Submit */}
            <div className="flex justify-center pt-1">
              <button
                type="submit"
                disabled={submitting || !type || !subject.trim() || !message.trim()}
                className="btn-primary px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest"
              >
                <SendIcon />
                {submitting ? t("pages.suggestions.sending") : t("pages.suggestions.send")}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SuggestionsPage;
