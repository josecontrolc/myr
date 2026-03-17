import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@shared/auth";

interface ExternalService {
  key: string;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  href: string;
}

const ExternalLinkIcon = () => (
  <svg
    className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-70 transition-opacity"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

const DueDiligenceIcon = () => (
  <svg
    className="w-6 h-6 text-secondary"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const TermsIcon = () => (
  <svg
    className="w-6 h-6 text-secondary"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);

const NewsletterIcon = () => (
  <svg
    className="w-6 h-6 text-secondary"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
    />
  </svg>
);

const SERVICES: ExternalService[] = [
  {
    key: "dueDiligence",
    icon: <DueDiligenceIcon />,
    titleKey: "pages.resources.services.dueDiligence.title",
    descriptionKey: "pages.resources.services.dueDiligence.description",
    href: "https://myfiles.rcloud.eu/auth/ws/rgroupe/?service=share#/filer/files",
  },
  {
    key: "terms",
    icon: <TermsIcon />,
    titleKey: "pages.resources.services.terms.title",
    descriptionKey: "pages.resources.services.terms.description",
    href: "https://www.rcarre.com/en/documents-utiles/",
  },
  {
    key: "newsletter",
    icon: <NewsletterIcon />,
    titleKey: "pages.resources.services.newsletter.title",
    descriptionKey: "pages.resources.services.newsletter.description",
    href: "https://www.rcarre.com/blog/",
  },
];

const ResourcesPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center">
        <p className="text-sec text-sm">{t("placeholders.loading")}</p>
      </div>
    );
  }

  return (
    <div className="bg-background dark:bg-background-dark py-10 min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="card rounded-xl px-8 py-6 text-center border-b border-border dark:border-border-dark">
          <h1 className="text-2xl font-bold text-textPrimary dark:text-white">
            {t("pages.resources.title")}
          </h1>
          <p className="mt-1.5 text-sm text-textSecondary dark:text-white/70 max-w-lg mx-auto">
            {t("pages.resources.subtitle")}
          </p>
        </div>

        {/* Service cards */}
        <div className="space-y-3">
          {SERVICES.map((service) => (
            <a
              key={service.key}
              href={service.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group card rounded-xl flex items-center gap-5 px-6 py-5 hover:border-secondary/40 dark:hover:border-secondary/40 transition-all duration-150 cursor-pointer"
            >
              {/* Icon box */}
              <div className="w-12 h-12 rounded-lg bg-secondary/10 dark:bg-secondary/15 flex items-center justify-center shrink-0">
                {service.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-secondary dark:text-white group-hover:underline">
                  {t(service.titleKey)}
                </p>
                {t(service.descriptionKey) !== service.descriptionKey && (
                  <p className="mt-0.5 text-xs text-textSecondary dark:text-white/70 leading-relaxed">
                    {t(service.descriptionKey)}
                  </p>
                )}
              </div>

              <ExternalLinkIcon />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
