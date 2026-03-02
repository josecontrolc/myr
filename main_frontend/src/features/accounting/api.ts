import { getJson } from "../../api/client";

export interface DecompteItem {
  id: number;
  label?: string;
  amount?: number;
  date?: string;
}

export interface DecompteResponse {
  data: DecompteItem[];
}

export async function fetchDecompte(accountId: number): Promise<DecompteResponse> {
  const path = `/accounting/${accountId}/decompte`;
  const response = await getJson<DecompteResponse>(path);
  return response;
}

