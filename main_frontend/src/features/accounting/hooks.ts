import { useQuery } from "@tanstack/react-query";
import { fetchDecompte } from "./api";
import type { DecompteResponse } from "./api";

export const accountingQueryKeys = {
  decompte: (accountId: number) => ["accounting", "decompte", accountId] as const,
};

export function useDecompte(accountId: number | null) {
  return useQuery<DecompteResponse>({
    queryKey: accountingQueryKeys.decompte(accountId ?? 0),
    queryFn: () => {
      if (accountId === null) {
        return Promise.reject(new Error("Account id is required"));
      }
      return fetchDecompte(accountId);
    },
    enabled: accountId !== null,
  });
}

