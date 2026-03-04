import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@shared/auth";
import { useTickets } from "../features/tickets/hooks";
import type { Ticket } from "../features/tickets/types";

const PAGE_SIZE = 10;

const TicketsPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const [page, setPage] = useState(1);

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
  } = useTickets({
    // For now, use the fixed supplier id used in the external API calls.
    suppliersIdAssign: 400007212,
    paginLimit: PAGE_SIZE,
    paginPage: page,
    orderByDesc: "date",
  });

  const tickets: Ticket[] = data?.data ?? [];

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
                {t("pages.tickets.title")}
              </h1>
              <p className="mt-1 text-sm text-sec">
                {t("pages.tickets.subtitle", "View and manage your support tickets")}
              </p>
            </div>
            <button
              type="button"
              className="btn-primary inline-flex items-center px-3 py-2 text-sm font-medium"
              onClick={() => refetch()}
            >
              {t("actions.refresh", "Refresh")}
            </button>
          </div>

          {isLoading && (
            <div className="py-10 text-center text-sec text-sm">
              {t("placeholders.loading")}
            </div>
          )}

          {isError && (
            <div className="alert-error">
              <p>{t("errors.generic", "There was a problem loading tickets")}</p>
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

          {!isLoading && !isError && tickets.length === 0 && (
            <div className="py-10 text-center text-sec text-sm">
              {t("pages.tickets.empty", "You do not have any tickets yet")}
            </div>
          )}

          {!isLoading && !isError && tickets.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-border dark:border-border-dark">
              <table className="min-w-full text-sm">
                <thead className="table-header">
                  <tr>
                    <th>
                      {t("tickets.columns.id", "ID")}
                    </th>
                    <th>
                      {t("tickets.columns.label", "Label")}
                    </th>
                    <th>
                      {t("tickets.columns.opened", "Opened")}
                    </th>
                    <th>
                      {t("tickets.columns.status", "Status")}
                    </th>
                    <th>
                      {t("tickets.columns.solved", "Solved")}
                    </th>
                  </tr>
                </thead>
                <tbody className="table-body bg-surface dark:bg-surface-dark">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="table-row">
                      <td className="table-cell">
                        {ticket.id}
                      </td>
                      <td className="table-cell">
                        {ticket.name}
                      </td>
                      <td className="table-cell-secondary whitespace-nowrap">
                        {ticket.date
                          ? new Date(ticket.date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="table-cell">
                        <span className="badge badge-neutral text-[11px]">
                          {ticket.status ?? "Unknown"}
                        </span>
                      </td>
                      <td className="table-cell-secondary whitespace-nowrap">
                        {ticket.solvedate
                          ? new Date(ticket.solvedate).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="pag-btn"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || isLoading}
            >
              {t("pagination.previous", "Previous")}
            </button>
            <span className="text-xs text-sec">
              {t("pagination.page", { page })}
            </span>
            <button
              type="button"
              className="pag-btn"
              onClick={() => setPage((current) => current + 1)}
              disabled={isLoading || tickets.length < PAGE_SIZE}
            >
              {t("pagination.next", "Next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;

