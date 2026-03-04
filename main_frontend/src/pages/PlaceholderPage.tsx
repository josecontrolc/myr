import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@shared/auth";

interface PlaceholderPageProps {
  titleKey: string;
}

const PlaceholderPage = ({ titleKey }: PlaceholderPageProps) => {
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
    <div className="bg-background dark:bg-background-dark py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card rounded-xl p-8 space-y-4">
          <h1 className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">
            {t(titleKey)}
          </h1>
          <p className="text-sm text-sec">
            {t("placeholders.underConstruction")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;

