import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@shared/auth";
import type { TicketListParams, TicketListApiResponse } from "./types";
import { fetchTickets } from "./api";

export const ticketsQueryKeys = {
  all: ["tickets"] as const,
  list: (params: TicketListParams) => ["tickets", "list", params] as const,
};

export function useTickets(params: TicketListParams) {
  const { jwtToken, jwtLoading } = useAuth();

  return useQuery<TicketListApiResponse>({
    queryKey: ticketsQueryKeys.list(params),
    enabled: !!jwtToken && !jwtLoading && !!params.orgId,
    queryFn: () => {
      if (!jwtToken) {
        return Promise.reject(
          new Error("No JWT token available. Please log out and log in again."),
        );
      }
      return fetchTickets(params, jwtToken);
    },
    keepPreviousData: true,
  });
}


