import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAccessLogs, createAccessLog, checkoutVisitor, fetchAccessStats } from "./api";

export function useAccessLogs(params: { building_id?: string; visitor_type?: string; search?: string } = {}) {
  return useQuery({ queryKey: ["access-logs", params], queryFn: () => fetchAccessLogs(params) });
}

export function useAccessStats() {
  return useQuery({ queryKey: ["access-stats"], queryFn: fetchAccessStats, refetchInterval: 30_000 });
}

export function useCreateAccessLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAccessLog,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["access-logs"] });
      qc.invalidateQueries({ queryKey: ["access-stats"] });
    },
  });
}

export function useCheckoutVisitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: checkoutVisitor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["access-logs"] });
      qc.invalidateQueries({ queryKey: ["access-stats"] });
    },
  });
}
