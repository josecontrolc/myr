import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@shared/auth";
import { useDecompte, type DecompteItem } from "../features/billing/useDecompte";

function formatDate(value: string | undefined): string {
  if (!value || value.length !== 8) return "—";
  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  const iso = `${year}-${month}-${day}`;
  const date = new Date(iso);
  // Fallback in case the constructed date is invalid.
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function formatAmount(value: string | undefined): string {
  if (!value) return "—";
  const parsed = Number(value.replace(",", "."));
  if (Number.isNaN(parsed)) return value;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed);
}

const InvoicesPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useDecompte("400000037");

  const rows: DecompteItem[] = data ?? [];

  const totalSolde = useMemo(() => {
    return rows.reduce((sum, item) => {
      const raw = item.solde ?? item.amount ?? "";
      const parsed = Number(raw.replace(",", "."));
      if (Number.isNaN(parsed)) return sum;
      return sum + parsed;
    }, 0);
  }, [rows]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
        <p className="text-sec text-sm">{t("placeholders.loading")}</p>
      </div>
    );
  }

  return (
    <div className="py-10 bg-background dark:bg-background-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-textPrimary dark:text-textPrimary-dark">
                {t("pages.billing.title")}
              </h1>
              <p className="mt-1 text-sm text-textSecondary dark:text-textSecondary-dark">
                {t(
                  "pages.billing.subtitle",
                  "Overview of your open invoices and account balance",
                )}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                className="btn-primary inline-flex items-center px-3 py-2 text-sm font-medium"
                onClick={() => refetch()}
              >
                {t("actions.refresh", "Refresh")}
              </button>
              <div className="text-xs text-textSecondary dark:text-textSecondary-dark">
                {t("billing.summary.totalOutstanding", "Total outstanding")}:{" "}
                <span className="font-semibold text-textPrimary dark:text-textPrimary-dark">
                  {formatAmount(totalSolde.toFixed(2))}
                </span>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="py-10 text-center text-sec text-sm">
              {t("placeholders.loading")}
            </div>
          )}

          {isError && (
            <div className="alert-error space-y-2">
              <p>
                {t(
                  "errors.billingLoad",
                  "There was a problem loading your invoices",
                )}
              </p>
              <p className="text-xs opacity-80 text-sec">
                {error instanceof Error ? error.message : String(error)}
              </p>
              <button
                type="button"
                className="mt-1 pag-btn"
                onClick={() => refetch()}
              >
                {t("actions.retry", "Try again")}
              </button>
            </div>
          )}

          {!isLoading && !isError && rows.length === 0 && (
            <div className="py-10 text-center text-sec text-sm">
              {t(
                "pages.billing.empty",
                "You do not have any open invoices for this account",
              )}
            </div>
          )}

          {!isLoading && !isError && rows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-border dark:border-border-dark">
              <table className="min-w-full text-sm">
                <thead className="table-header">
                  <tr>
                    <th>
                      {t("billing.columns.invoice", "Invoice")}
                    </th>
                    <th>
                      {t("billing.columns.label", "Label")}
                    </th>
                    <th>
                      {t("billing.columns.issueDate", "Issue date")}
                    </th>
                    <th>
                      {t("billing.columns.dueDate", "Due date")}
                    </th>
                    <th>
                      {t("billing.columns.amount", "Amount")}
                    </th>
                    <th>
                      {t("billing.columns.balance", "Balance")}
                    </th>
                    <th>
                      {t("billing.columns.flags", "Flags")}
                    </th>
                  </tr>
                </thead>
                <tbody className="table-body bg-surface dark:bg-surface-dark">
                  {rows.map((item) => (
                    <tr key={item.Facture} className="table-row">
                      <td className="table-cell">
                        {item.Facture}
                      </td>
                      <td className="table-cell">
                        {item.Libelle?.trim() || "—"}
                      </td>
                      <td className="table-cell-secondary">
                        {formatDate(item.Emission)}
                      </td>
                      <td className="table-cell-secondary">
                        {formatDate(item.Echeance)}
                      </td>
                      <td className="table-cell-secondary">
                        {formatAmount(item.amount ?? item.Mnt_Init)}
                      </td>
                      <td className="table-cell-secondary">
                        {formatAmount(item.solde ?? item.Solde)}
                      </td>
                      <td className="table-cell-secondary">
                        <div className="flex flex-wrap gap-1">
                          {item.Blq !== 0 && (
                            <span className="badge badge-warning text-[11px]">
                              {t("billing.flags.blocked", "Blocked")}
                            </span>
                          )}
                          {item.Plainte && item.Plainte.trim().length > 0 && (
                            <span className="badge badge-error text-[11px]">
                              {t("billing.flags.complaint", "Complaint")}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;

