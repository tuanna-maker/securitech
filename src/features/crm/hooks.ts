import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClients, fetchClientBuildings, fetchPipelineDeals, fetchClientStats, createClient, updateClient, deleteClient } from "./api";

export function useClients(params: { status?: string; type?: string } = {}) {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => fetchClients(params),
  });
}

export function useClientBuildings(clientId: string | undefined) {
  return useQuery({
    queryKey: ["client-buildings", clientId],
    queryFn: () => fetchClientBuildings(clientId!),
    enabled: !!clientId,
  });
}

export function usePipelineDeals() {
  return useQuery({
    queryKey: ["pipeline-deals"],
    queryFn: fetchPipelineDeals,
  });
}

export function useClientStats() {
  return useQuery({
    queryKey: ["client-stats"],
    queryFn: fetchClientStats,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client-stats"] });
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<Parameters<typeof createClient>[0]>) =>
      updateClient(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client-stats"] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client-stats"] });
    },
  });
}
