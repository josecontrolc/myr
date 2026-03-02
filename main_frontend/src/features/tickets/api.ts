import { getJson, postJson } from "../../api/client";
import type {
  Ticket,
  TicketListApiResponse,
  TicketListParams,
  TicketListPayload,
} from "./types";

const TICKETS_PATH = "/tickets";
const TICKETS_GRAPHQL_PATH = "/tickets/graphql";

export async function fetchTickets(
  params: TicketListParams,
): Promise<TicketListApiResponse> {
  const payload = await postJson<TicketListParams, TicketListPayload>(
    TICKETS_GRAPHQL_PATH,
    params,
  );

  const list: Ticket[] = payload.ticket?.data ?? [];

  return {
    data: list,
  };
}

export async function fetchTicketById(id: number): Promise<Ticket> {
  const ticket = await getJson<Ticket>(`${TICKETS_PATH}/${id}`);
  return ticket;
}

