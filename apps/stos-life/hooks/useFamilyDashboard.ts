import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { fetchFamilyDashboard, getFamilyDashboardFallback } from "../lib/familyApi";

export function useFamilyDashboard() {
  const { resident, session } = useAuth();

  return useQuery({
    queryKey: ["family-dashboard", resident?.id],
    enabled: !!session && !!resident?.id,
    queryFn: fetchFamilyDashboard,
    placeholderData: getFamilyDashboardFallback,
    staleTime: 60_000,
  });
}
