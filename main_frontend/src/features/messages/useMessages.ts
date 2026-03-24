import { useQuery } from "@tanstack/react-query";
import { postJson } from "../../api/client";
import { useAuth } from "@shared/auth";

export interface PortalMessage {
  position: number;
  type: string;
  page: string | null;
  redirect: string | { en?: string; fr?: string } | null;
  shortMessage: { en?: string; fr?: string } | null;
  longMessage: { en?: string; fr?: string } | null | unknown[];
}

interface MessagesResponse {
  status: string;
  op: string;
  data: PortalMessage[];
}

export const messagesQueryKeys = {
  all: ["messages"] as const,
  client: (orgId: string) => ["messages", "client", orgId] as const,
};

export function useMessages(orgId: string | null) {
  const { jwtToken, jwtLoading } = useAuth();

  return useQuery<PortalMessage[]>({
    queryKey: messagesQueryKeys.client(orgId ?? ""),
    enabled: !!jwtToken && !jwtLoading && !!orgId,
    queryFn: async () => {
      if (!jwtToken) {
        return Promise.reject(new Error("No JWT token available."));
      }
      const raw = await postJson<Record<string, never>, MessagesResponse>(
        `/orgs/${orgId}/proxy/messages`,
        {},
        { Authorization: `Bearer ${jwtToken}` },
      );
      return raw?.data ?? [];
    },
  });
}
