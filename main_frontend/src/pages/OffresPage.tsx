import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@shared/auth";
import { getJson } from "../api/client";
import { useOffers, type OfferItem } from "../features/offers/useOffers";
import Pagination from "../components/Pagination";
import PageHeader from "../components/PageHeader";

interface OrgsResponse {
  organizations: { id: string }[];
}

const PAGE_SIZE = 10;

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function totalAmount(offer: OfferItem): string {
  if (!offer.articles || offer.articles.length === 0) return "—";
  const total = offer.articles.reduce(
    (sum, a) => sum + (a.prix_vente ?? 0) * (a.quantity ?? 1),
    0,
  );
  if (total === 0) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(total);
}

const OffresPage = () => {
  const { jwtToken, loading: authLoading, jwtLoading } = useAuth();
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgError, setOrgError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function fetchOrg() {
      if (authLoading || jwtLoading) return;
      if (!jwtToken) {
        setOrgError("No JWT token available. Please log out and log in again.");
        return;
      }
      try {
        setOrgError(null);
        const { organizations } = await getJson<OrgsResponse>(
          "/orgs/mine",
          undefined,
          { Authorization: `Bearer ${jwtToken}` },
        );
        if (organizations.length === 0) {
          setOrgError("No organization found for the current user.");
          return;
        }
        setOrgId(organizations[0].id);
      } catch (err: unknown) {
        const errStatus =
          typeof err === "object" && err && "statusCode" in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;
        if (errStatus === 401) setOrgError("Your session is not authorized. Please sign in again.");
        else if (errStatus === 403) setOrgError("Organization access denied for this account.");
        else if (errStatus === 502) setOrgError("Unable to reach the external data service. Please contact your administrator.");
        else setOrgError(err instanceof Error ? err.message : "An error occurred while fetching your organization.");
      }
    }
    fetchOrg();
  }, [jwtToken, authLoading, jwtLoading]);

  const { data, isLoading, isRefetching, isError, error, refetch } = useOffers(orgId);

  const rows: OfferItem[] = data ?? [];

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const matchesSearch =
        search === "" ||
        (item.offer_num ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (item.title ?? "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "" ||
        (item.status ?? "").toLowerCase() === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [rows, search, status]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const statusOptions = useMemo(() => {
    const statuses = new Set<string>();
    rows.forEach((item) => { if (item.status) statuses.add(item.status); });
    return Array.from(statuses).map((s) => ({ label: s, value: s }));
  }, [rows]);

  if (authLoading || jwtLoading || (orgId === null && !orgError)) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary-dark"></div>
      </div>
    );
  }

  if (orgError) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          {orgError}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background dark:bg-background-dark min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        <PageHeader
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
          title={t("pages.offers.title")}
          count={!isLoading ? filteredRows.length : undefined}
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          statusOptions={statusOptions}
          isRefetching={isRefetching}
          onRefetch={refetch}
          disabled={!!orgError}
        />

        <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark card--square-tl shadow-sm overflow-hidden">
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

          {!isLoading && !isError && filteredRows.length === 0 && (
            <div className="py-16 text-center text-textSecondary dark:text-textSecondary-dark text-sm">
              {t("pages.offers.empty")}
            </div>
          )}

          {!isLoading && !isError && filteredRows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest">
                      {t("offers.columns.reference")}
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest">
                      {t("offers.columns.description")}
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest">
                      {t("offers.columns.date")}
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest">
                      {t("offers.columns.amount")}
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest">
                      {t("offers.columns.status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                  {pagedRows.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-backgroundSecondary/50 dark:hover:bg-backgroundSecondary-dark/50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/offer/${item.id}`, { state: { offer: item } })}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-textPrimary dark:text-textPrimary-dark group-hover:text-pink transition-colors">
                          {item.offer_num ?? `#${item.id}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-textPrimary dark:text-textPrimary-dark">
                          {item.title ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-textSecondary dark:text-textSecondary-dark whitespace-nowrap">
                        {formatDate(item.date_emission)}
                      </td>
                      <td className="px-6 py-4 text-sm text-textSecondary dark:text-textSecondary-dark whitespace-nowrap">
                        {totalAmount(item)}
                      </td>
                      <td className="px-6 py-4">
                        {item.status ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-tight bg-primary/10 text-textSecondary dark:bg-white/10 dark:text-white/60 border border-primary/20">
                            {t(`offers.status.${item.status}`, item.status)}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!isLoading && !isError && filteredRows.length > PAGE_SIZE && (
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={filteredRows.length}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        )}

      </div>
    </div>
  );
};

export default OffresPage;
