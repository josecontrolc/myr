import { postJson } from "../../api/client";
import type {
  Ticket,
  TicketListApiResponse,
  TicketListParams,
  TicketListPayload,
} from "./types";

const TICKETS_PROXY_PATH = (orgId: string) => `/orgs/${orgId}/proxy/tickets`;

export async function fetchTickets(
  params: TicketListParams,
  jwtToken: string,
): Promise<TicketListApiResponse> {
  const { orgId, ...pagination } = params;
  const payload = await postJson<typeof pagination, TicketListPayload>(
    TICKETS_PROXY_PATH(orgId),
    pagination,
    {
      Authorization: `Bearer ${jwtToken}`,
    },
  );

  const list: Ticket[] = payload.ticket?.data ?? [];

  return {
    data: list,
  };
}

