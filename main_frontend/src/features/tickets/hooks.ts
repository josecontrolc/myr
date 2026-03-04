import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@shared/auth";
import type { Ticket, TicketListParams, TicketListApiResponse } from "./types";
import { fetchTickets, fetchTicketById } from "./api";

export const ticketsQueryKeys = {
  all: ["tickets"] as const,
  list: (params: TicketListParams) => ["tickets", "list", params] as const,
  detail: (id: number) => ["tickets", "detail", id] as const,
};

export function useTickets(
  params: TicketListParams,
) {
  const { jwtToken } = useAuth();

  return useQuery<TicketListApiResponse>({
    queryKey: ticketsQueryKeys.list(params),
    enabled: !!jwtToken,
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

export function useTicketDetail(id: number | null) {
  const { jwtToken } = useAuth();

  return useQuery<Ticket>({
    queryKey: ticketsQueryKeys.detail(id ?? 0),
    queryFn: () => {
      if (id === null) {
        return Promise.reject(new Error("Ticket id is required"));
      }
      if (!jwtToken) {
        return Promise.reject(
          new Error("No JWT token available. Please log out and log in again."),
        );
      }
      return fetchTicketById(id, jwtToken);
    },
    enabled: id !== null && !!jwtToken,
  });
}

