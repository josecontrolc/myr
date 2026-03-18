import { useQuery } from "@tanstack/react-query";
import { postJson } from "../../api/client";
import { useAuth } from "@shared/auth";

export interface OfferArticle {
  article_id: number;
  code_article: string;
  mode_tarif: string;
  quantity: number;
  hide_price: number;
  prix_vente: number;
  description_courte: string;
}

export interface OfferItem {
  id: number | string;
  offer_num: string | null;
  title: string | null;
  status: string | null;
  date_emission: string | null;
  amount: Array<{ fixedPrice?: number; monthlyPrice?: number; annualPrice?: number }>;
  articles: OfferArticle[];
  [key: string]: unknown;
}

export const offersQueryKeys = {
  all: ["offers"] as const,
  client: (orgId: string) => ["offers", "client", orgId] as const,
};

function extractRows(raw: unknown): OfferItem[] {
  if (Array.isArray(raw)) return raw as OfferItem[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const data = obj["data"];
    if (Array.isArray(data)) return data as OfferItem[];
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return Object.values(data as Record<string, unknown>) as OfferItem[];
    }
    for (const key of ["offers", "items", "list", "documents"]) {
      if (Array.isArray(obj[key])) return obj[key] as OfferItem[];
    }
  }
  return [];
}

export function useOffers(orgId: string | null) {
  const { jwtToken, jwtLoading } = useAuth();

  return useQuery<OfferItem[]>({
    queryKey: offersQueryKeys.client(orgId ?? ""),
    enabled: !!jwtToken && !jwtLoading && !!orgId,
    queryFn: async () => {
      if (!jwtToken) {
        return Promise.reject(new Error("No JWT token available."));
      }
      const raw = await postJson<Record<string, never>, unknown>(
        `/orgs/${orgId}/proxy/offer`,
        {},
        { Authorization: `Bearer ${jwtToken}` },
      );
      return extractRows(raw);
    },
  });
}
