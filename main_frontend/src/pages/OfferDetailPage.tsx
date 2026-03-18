import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { OfferItem } from "../features/offers/useOffers";

interface LocationState {
  offer?: OfferItem;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const OfferDetailPage = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState | null };
  const offer = state?.offer;

  if (!offer) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center gap-4">
        <p className="text-textSecondary dark:text-textSecondary-dark text-sm">
          {t("offers.detail.notFound")}
        </p>
        <button
          type="button"
          onClick={() => navigate("/offer")}
          className="text-secondary text-sm hover:underline"
        >
          ← {t("offers.detail.back")}
        </button>
      </div>
    );
  }

  const singleTotal = (offer.articles ?? []).reduce(
    (sum, a) => sum + (a.prix_vente ?? 0) * (a.quantity ?? 1),
    0,
  );
  const monthlyTotal = (offer.amount ?? []).reduce(
    (sum, a) => sum + (a.monthlyPrice ?? 0),
    0,
  );
  const annualTotal = (offer.amount ?? []).reduce(
    (sum, a) => sum + (a.annualPrice ?? 0),
    0,
  );

  const statusLabel = offer.status
    ? t(`offers.status.${offer.status}`, offer.status)
    : "—";

  const labelClass = "text-xs font-medium text-secondary dark:text-secondary";
  const valueClass = "text-sm font-bold text-textPrimary dark:text-textPrimary-dark";

  return (
    <div className="flex-1 bg-background dark:bg-background-dark min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate("/offer")}
          className="text-sm text-textSecondary dark:text-textSecondary-dark hover:text-secondary transition-colors"
        >
          ← {t("offers.detail.back")}
        </button>

        {/* ── Offer details ──────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-textPrimary dark:text-textPrimary-dark">
            {t("offers.detail.title")}
          </h2>

          <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-3">
              {/* Left column */}
              <div className="space-y-3">
                <div>
                  <span className={labelClass}>{t("offers.detail.id")}</span>
                  <p className={valueClass}>{offer.id}</p>
                </div>
                <div>
                  <span className={labelClass}>{t("offers.detail.offerTitle")}</span>
                  <p className={valueClass}>{offer.title ?? "—"}</p>
                </div>
                <div>
                  <span className={labelClass}>{t("offers.detail.issueDate")}</span>
                  <p className={`text-sm ${offer.date_emission ? "text-textPrimary dark:text-textPrimary-dark font-bold" : "text-textSecondary dark:text-textSecondary-dark"}`}>
                    {formatDate(offer.date_emission)}
                  </p>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-3">
                <div>
                  <span className={labelClass}>{t("offers.detail.number")}</span>
                  <p className={valueClass}>{offer.offer_num ?? "—"}</p>
                </div>
                <div>
                  <span className={labelClass}>{t("offers.detail.status")}</span>
                  <p className={valueClass}>{statusLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Financial summary ──────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-textPrimary dark:text-textPrimary-dark">
            {t("offers.detail.financialSummary")}
          </h2>

          <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded shadow-sm p-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className={labelClass}>{t("offers.detail.singleTotal")}</span>
                <p className={valueClass}>{formatCurrency(singleTotal)}</p>
              </div>
              <div>
                <span className={labelClass}>{t("offers.detail.monthlyTotal")}</span>
                <p className={valueClass}>{formatCurrency(monthlyTotal)}</p>
              </div>
              <div>
                <span className={labelClass}>{t("offers.detail.annualTotal")}</span>
                <p className={valueClass}>{formatCurrency(annualTotal)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Articles list ──────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-textPrimary dark:text-textPrimary-dark">
            {t("offers.detail.articlesList")}
          </h2>

          <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded shadow-sm overflow-hidden">
            {(!offer.articles || offer.articles.length === 0) ? (
              <div className="py-12 text-center text-textSecondary dark:text-textSecondary-dark text-sm">
                —
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border dark:border-border-dark">
                      <th className="px-6 py-4 text-xs font-bold text-textPrimary dark:text-textPrimary-dark">
                        {t("offers.detail.articleId")}
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-textPrimary dark:text-textPrimary-dark">
                        {t("offers.detail.articleCode")}
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-textPrimary dark:text-textPrimary-dark">
                        {t("offers.detail.articlePricingTerms")}
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-textPrimary dark:text-textPrimary-dark">
                        {t("offers.detail.articleQty")}
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-textPrimary dark:text-textPrimary-dark">
                        {t("offers.detail.articlePrice")}
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-textPrimary dark:text-textPrimary-dark">
                        {t("offers.detail.articleDescription")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 dark:divide-border-dark/20">
                    {offer.articles.map((article) => (
                      <tr
                        key={article.article_id}
                        className="hover:bg-backgroundSecondary/30 dark:hover:bg-backgroundSecondary-dark/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-textSecondary dark:text-textSecondary-dark">
                          {article.article_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-textSecondary dark:text-textSecondary-dark">
                          {article.code_article || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-textSecondary dark:text-textSecondary-dark">
                          {article.mode_tarif || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-textSecondary dark:text-textSecondary-dark">
                          {article.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-textSecondary dark:text-textSecondary-dark whitespace-nowrap">
                          {article.hide_price
                            ? "—"
                            : formatCurrency(article.prix_vente)}
                        </td>
                        <td className="px-6 py-4 text-sm text-textPrimary dark:text-textPrimary-dark">
                          {article.description_courte || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default OfferDetailPage;
