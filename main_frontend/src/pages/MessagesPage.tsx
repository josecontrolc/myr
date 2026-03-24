import { useTranslation } from "react-i18next";
import { useMessages, type PortalMessage } from "../features/messages/useMessages";
import { useOrg } from "../hooks/useOrg";

function pickLang(obj: { en?: string; fr?: string } | null | undefined, lang: string): string {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return "";
  const key = lang.startsWith("fr") ? "fr" : "en";
  return obj[key] ?? obj.en ?? obj.fr ?? "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function getLongMessage(msg: PortalMessage, lang: string): string {
  const lm = msg.longMessage;
  if (!lm || Array.isArray(lm)) return "";
  const text = pickLang(lm as { en?: string; fr?: string }, lang);
  return stripHtml(text);
}

const WarningIcon = () => (
  <svg
    className="w-5 h-5 text-textPrimary dark:text-textPrimary-dark"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
  </svg>
);

const InfoIcon = () => (
  <span className="text-sm font-serif italic text-textPrimary dark:text-textPrimary-dark select-none">
    i
  </span>
);

const MessagesPage = () => {
  const { t, i18n } = useTranslation("common");
  const orgId = useOrg();
  const lang = i18n.language;

  const { data, isLoading, isError, error, refetch } = useMessages(orgId);
  const messages: PortalMessage[] = data ?? [];

  return (
    <div className="flex-1 bg-background dark:bg-background-dark min-h-screen">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border dark:border-border-dark">
            <h1 className="text-lg font-semibold text-center text-textPrimary dark:text-textPrimary-dark">
              {t("pages.messages.title")}
            </h1>
          </div>

          {isLoading && (
            <div className="py-16 text-center text-textSecondary dark:text-textSecondary-dark text-sm">
              {t("placeholders.loading")}
            </div>
          )}

          {isError && (
            <div className="p-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
                <p>{t("errors.generic")}</p>
                <p className="text-xs opacity-80 mt-1">
                  {error instanceof Error ? error.message : String(error)}
                </p>
                <button type="button" className="mt-2 text-xs underline" onClick={() => refetch()}>
                  {t("actions.retry")}
                </button>
              </div>
            </div>
          )}

          {!isLoading && !isError && messages.length === 0 && (
            <div className="py-16 text-center text-textSecondary dark:text-textSecondary-dark text-sm">
              {t("pages.messages.empty")}
            </div>
          )}

          {!isLoading && !isError && messages.length > 0 && (
            <ul className="divide-y divide-border dark:divide-border-dark">
              {messages.map((msg, idx) => {
                const title = pickLang(msg.shortMessage, lang);
                const subtitle = getLongMessage(msg, lang);
                const isWarning = msg.type === "warning";
                return (
                  <li
                    key={msg.position ?? idx}
                    className="flex items-start gap-4 px-6 py-5"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full border border-border dark:border-border-dark flex items-center justify-center bg-surface dark:bg-surface-dark">
                      {isWarning ? <WarningIcon /> : <InfoIcon />}
                    </div>
                    <div className="flex flex-col justify-center min-h-10">
                      <p className="text-sm font-semibold text-textPrimary dark:text-textPrimary-dark">
                        {title}
                      </p>
                      {subtitle && (
                        <p className="text-xs text-textSecondary dark:text-textSecondary-dark mt-0.5">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
