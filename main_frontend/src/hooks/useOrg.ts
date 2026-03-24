import { useState, useEffect } from "react";
import { useAuth } from "@shared/auth";
import { getJson } from "../api/client";

interface OrgsResponse {
  organizations: { id: string }[];
}

export function useOrg(): string | null {
  const { jwtToken, loading: authLoading, jwtLoading } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || jwtLoading || !jwtToken) return;
    getJson<OrgsResponse>("/orgs/mine", undefined, {
      Authorization: `Bearer ${jwtToken}`,
    })
      .then(({ organizations }) => {
        if (organizations.length > 0) setOrgId(organizations[0].id);
      })
      .catch(() => {});
  }, [jwtToken, authLoading, jwtLoading]);

  return orgId;
}
