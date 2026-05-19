import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { fetchFamilySpending, getFamilySpendingFallback } from "../lib/familyApi";

export function useFamilySpending(year?: number, month?: number) {
  const { resident, session } = useAuth();
  const y = year ?? new Date().getFullYear();
  const m = month ?? new Date().getMonth() + 1;

  return useQuery({
    queryKey: ["family-spending", resident?.id, y, m],
    enabled: !!session && !!resident?.id,
    queryFn: () => fetchFamilySpending(y, m),
    placeholderData: getFamilySpendingFallback,
    staleTime: 60_000,
  });
}
