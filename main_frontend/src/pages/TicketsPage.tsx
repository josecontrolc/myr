import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@shared/auth";
import { getJson } from "../api/client";
import { useTickets } from "../features/tickets/hooks";
import type { Ticket } from "../features/tickets/types";

const PAGE_SIZE = 10;

interface OrgsResponse {
  organizations: { id: string }[];
}

const TicketsPage = () => {
  const { jwtToken, loading: authLoading, jwtLoading } = useAuth();
  const { t } = useTranslation("common");
  const [page, setPage] = useState(1);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgError, setOrgError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrg() {
      if (authLoading || jwtLoading) {
        return;
      }

      if (!jwtToken) {
        setOrgError("No JWT token available. Please log out and log in again.");
        return;
      }

      try {
        setOrgError(null);
        const { organizations } = await getJson<OrgsResponse>("/orgs/mine", undefined, {
          Authorization: `Bearer ${jwtToken}`,
        });

        if (organizations.length === 0) {
          setOrgError("No organization found for the current user.");
          return;
        }

        setOrgId(organizations[0].id);
      } catch (err: any) {
        const status =
          typeof err === "object" && err && "statusCode" in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;

        if (status === 401) {
          setOrgError("Your session is not authorized. Please sign in again.");
        } else if (status === 403) {
          setOrgError("Organization access denied for this account.");
        } else if (status === 502) {
          setOrgError("Unable to reach the external data service. Please contact your administrator.");
        } else {
          setOrgError(err.message || "An error occurred while fetching your organization.");
        }
      }
    }

    fetchOrg();
  }, [jwtToken, authLoading, jwtLoading]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useTickets({
    orgId: orgId ?? "",
    paginLimit: PAGE_SIZE,
    paginPage: page,
    orderByDesc: "date",
  });

  const tickets: Ticket[] = data?.data ?? [];

  if (authLoading || jwtLoading || (orgId === null && !orgError)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary-dark"></div>
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

          {orgError && (
            <div className="alert-error">
              <p>{orgError}</p>
            </div>
          )}

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

          {!isLoading && !isError && !orgError && tickets.length === 0 && (
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
