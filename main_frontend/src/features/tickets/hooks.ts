import { useQuery } from "@tanstack/react-query";
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
  return useQuery<TicketListApiResponse>({
    queryKey: ticketsQueryKeys.list(params),
    queryFn: () => fetchTickets(params),
    keepPreviousData: true,
  });
}

export function useTicketDetail(id: number | null) {
  return useQuery<Ticket>({
    queryKey: ticketsQueryKeys.detail(id ?? 0),
    queryFn: () => {
      if (id === null) {
        return Promise.reject(new Error("Ticket id is required"));
      }
      return fetchTicketById(id);
    },
    enabled: id !== null,
  });
}

