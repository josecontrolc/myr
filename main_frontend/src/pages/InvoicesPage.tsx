import { useMemo } from "react";
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

  if (!loading && !user) {
    navigate("/login");
  }

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">{t("placeholders.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("pages.billing.title")}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
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
              <div className="text-xs text-gray-600">
                {t("billing.summary.totalOutstanding", "Total outstanding")}:{" "}
                <span className="font-semibold text-gray-900">
                  {formatAmount(totalSolde.toFixed(2))}
                </span>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="py-10 text-center text-gray-500 text-sm">
              {t("placeholders.loading")}
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 space-y-2">
              <p>
                {t(
                  "errors.billingLoad",
                  "There was a problem loading your invoices",
                )}
              </p>
              <p className="text-xs opacity-80">
                {error instanceof Error ? error.message : String(error)}
              </p>
              <button
                type="button"
                className="mt-1 inline-flex items-center px-2.5 py-1.5 rounded-md border border-red-200 text-xs font-medium text-red-700 hover:bg-red-100"
                onClick={() => refetch()}
              >
                {t("actions.retry", "Try again")}
              </button>
            </div>
          )}

          {!isLoading && !isError && rows.length === 0 && (
            <div className="py-10 text-center text-gray-500 text-sm">
              {t(
                "pages.billing.empty",
                "You do not have any open invoices for this account",
              )}
            </div>
          )}

          {!isLoading && !isError && rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("billing.columns.invoice", "Invoice")}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("billing.columns.label", "Label")}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("billing.columns.issueDate", "Issue date")}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("billing.columns.dueDate", "Due date")}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("billing.columns.amount", "Amount")}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("billing.columns.balance", "Balance")}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("billing.columns.flags", "Flags")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {rows.map((item) => (
                    <tr key={item.Facture}>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                        {item.Facture}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                        {item.Libelle?.trim() || "—"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                        {formatDate(item.Emission)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                        {formatDate(item.Echeance)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                        {formatAmount(item.amount ?? item.Mnt_Init)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                        {formatAmount(item.solde ?? item.Solde)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-700">
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

