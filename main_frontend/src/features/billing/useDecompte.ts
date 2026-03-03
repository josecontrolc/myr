import { useQuery } from "@tanstack/react-query";
import { getJson } from "../../api/client";
import { useAuth } from "@shared/auth";

export type DecompteItem = {
  Client: number;
  Bl_Adm: number;
  Bl_TICAL: number;
  Facture: string;
  Libelle: string;
  Emission: string;
  Echeance: string;
  Mnt_Init: string;
  Solde: string;
  Blq: number;
  Plainte: string;
  Debut: string;
  Fin: string;
  Relance: number;
  Rappel: number;
  dummy?: string;
  amount?: string;
  solde?: string;
};

export const decompteQueryKeys = {
  all: ["decompte"] as const,
  client: (clientId: string | number) => ["decompte", "client", clientId] as const,
};

export function useDecompte(clientId: string = "400000037") {
  const { jwtToken } = useAuth();

  return useQuery<DecompteItem[]>({
    queryKey: decompteQueryKeys.client(clientId),
    enabled: !!jwtToken,
    queryFn: () => {
      if (!jwtToken) {
        return Promise.reject(
          new Error("No JWT token available. Please log out and log in again."),
        );
      }

      return getJson<DecompteItem[]>(
        `/accounting/${clientId}/decompte`,
        undefined,
        {
          Authorization: `Bearer ${jwtToken}`,
        },
      );
    },
  });
}

