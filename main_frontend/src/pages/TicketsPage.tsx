import { useState } from "react";
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

  if (!loading && !user) {
    navigate("/login");
  }

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useTickets({
    suppliersIdAssign: Number(user?.id ?? 0),
    paginLimit: PAGE_SIZE,
    paginPage: page,
    orderByDesc: "date",
  });

  const tickets: Ticket[] = data?.data ?? [];

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
                {t("pages.tickets.title")}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
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
            <div className="py-10 text-center text-gray-500 text-sm">
              {t("placeholders.loading")}
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 space-y-2">
              <p>{t("errors.generic", "There was a problem loading tickets")}</p>
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

          {!isLoading && !isError && tickets.length === 0 && (
            <div className="py-10 text-center text-gray-500 text-sm">
              {t("pages.tickets.empty", "You do not have any tickets yet")}
            </div>
          )}

          {!isLoading && !isError && tickets.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("tickets.columns.id", "Id")}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("tickets.columns.name", "Title")}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("tickets.columns.status", "Status")}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("tickets.columns.date", "Date")}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("tickets.columns.priority", "Priority")}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("tickets.columns.category", "Category")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                        {ticket.id}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                        {ticket.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="badge bg-gray-100 text-gray-700">
                          {ticket.status ?? "Unknown"}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                        {ticket.date
                          ? new Date(ticket.date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                        {ticket.priority_v2 ?? "—"}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                        {ticket.ticketcategories?.[0]?.name ?? "—"}
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
              className="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || isLoading}
            >
              {t("pagination.previous", "Previous")}
            </button>
            <span className="text-xs text-gray-600">
              {t("pagination.page", { page })}
            </span>
            <button
              type="button"
              className="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
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

