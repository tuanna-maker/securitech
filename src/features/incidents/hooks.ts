import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchIncidents,
  fetchIncidentTimeline,
  fetchIncidentStats,
  createIncident,
  updateIncidentStatus,
  deleteIncident,
  type IncidentListParams,
  type CreateIncidentInput,
} from "./api";

export function useIncidents(params: IncidentListParams = {}) {
  return useQuery({
    queryKey: ["incidents", params],
    queryFn: () => fetchIncidents(params),
  });
}

export function useIncidentTimeline(incidentId: string | null) {
  return useQuery({
    queryKey: ["incident-timeline", incidentId],
    queryFn: () => fetchIncidentTimeline(incidentId!),
    enabled: !!incidentId,
  });
}

export function useIncidentStats() {
  return useQuery({
    queryKey: ["incident-stats"],
    queryFn: fetchIncidentStats,
    refetchInterval: 30_000,
  });
}

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateIncidentInput) => createIncident(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incidents"] });
      qc.invalidateQueries({ queryKey: ["incident-stats"] });
    },
  });
}

export function useUpdateIncidentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateIncidentStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incidents"] });
      qc.invalidateQueries({ queryKey: ["incident-stats"] });
    },
  });
}

export function useDeleteIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIncident(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incidents"] });
      qc.invalidateQueries({ queryKey: ["incident-stats"] });
    },
  });
}
