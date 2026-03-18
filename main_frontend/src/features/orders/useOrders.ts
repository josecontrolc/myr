import { useQuery } from "@tanstack/react-query";
import { postJson } from "../../api/client";
import { useAuth } from "@shared/auth";

export interface OrderArticle {
  article_id: number;
  code_article: string;
  mode_tarif: string;
  quantity: number;
  hide_price: number;
  prix_vente: number;
  description_courte: string;
}

export interface OrderItem {
  id: number | string;
  command_num: string | null;
  title: string | null;
  status: string | null;
  date_emission: string | null;
  amount: Array<{ fixedPrice?: number; monthlyPrice?: number; annualPrice?: number }>;
  articles: OrderArticle[];
}

export const orderQueryKeys = {
  all: ["orders"] as const,
  client: (orgId: string) => ["orders", "client", orgId] as const,
};

function extractOrders(raw: unknown): OrderItem[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  const data = obj["data"];
  if (!data || typeof data !== "object" || Array.isArray(data)) return [];
  return Object.values(data as Record<string, unknown>) as OrderItem[];
}

export function useOrders(orgId: string | null) {
  const { jwtToken, jwtLoading } = useAuth();

  return useQuery<OrderItem[]>({
    queryKey: orderQueryKeys.client(orgId ?? ""),
    enabled: !!jwtToken && !jwtLoading && !!orgId,
    queryFn: async () => {
      if (!jwtToken) {
        return Promise.reject(new Error("No JWT token available."));
      }
      const raw = await postJson<Record<string, never>, unknown>(
        `/orgs/${orgId}/proxy/orders`,
        {},
        { Authorization: `Bearer ${jwtToken}` },
      );
      return extractOrders(raw);
    },
  });
}
