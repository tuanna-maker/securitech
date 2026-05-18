import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchResidents, createResident, updateResident, deleteResident,
  fetchParcels, updateParcel,
  fetchSupportRequests, updateSupportRequest,
  fetchContractors, fetchQuickServices, fetchSOSCalls, updateSOSCall,
  fetchResidentServiceStats,
} from "./api";
import type { Database } from "../../lib/db";

type ResidentInsert = Database["public"]["Tables"]["residents"]["Insert"];
type ResidentUpdate = Database["public"]["Tables"]["residents"]["Update"];
type ParcelUpdate = Database["public"]["Tables"]["parcels"]["Update"];
type SupportRequestUpdate = Database["public"]["Tables"]["support_requests"]["Update"];

export function useResidents(params: { building_id?: string; status?: string; search?: string; is_elderly?: boolean; is_child?: boolean } = {}) {
  return useQuery({ queryKey: ["residents", params], queryFn: () => fetchResidents(params) });
}

export function useCreateResident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ResidentInsert) => createResident(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["residents"] }); qc.invalidateQueries({ queryKey: ["resident-service-stats"] }); },
  });
}

export function useUpdateResident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & ResidentUpdate) => updateResident(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["residents"] }); },
  });
}

export function useDeleteResident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteResident,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["residents"] }); qc.invalidateQueries({ queryKey: ["resident-service-stats"] }); },
  });
}

export function useParcels(params: { status?: string; building_id?: string } = {}) {
  return useQuery({ queryKey: ["parcels", params], queryFn: () => fetchParcels(params) });
}

export function useUpdateParcel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & ParcelUpdate) => updateParcel(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["parcels"] }); qc.invalidateQueries({ queryKey: ["resident-service-stats"] }); },
  });
}

export function useSupportRequests(params: { status?: string; priority?: string } = {}) {
  return useQuery({ queryKey: ["support-requests", params], queryFn: () => fetchSupportRequests(params) });
}

export function useUpdateSupportRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & SupportRequestUpdate) => updateSupportRequest(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["support-requests"] }); qc.invalidateQueries({ queryKey: ["resident-service-stats"] }); },
  });
}

export function useContractors(params: { status?: string } = {}) {
  return useQuery({ queryKey: ["contractors", params], queryFn: () => fetchContractors(params) });
}

export function useQuickServices(params: { status?: string } = {}) {
  return useQuery({ queryKey: ["quick-services", params], queryFn: () => fetchQuickServices(params) });
}

export function useSOSCalls(params: { status?: string } = {}) {
  return useQuery({ queryKey: ["sos-calls", params], queryFn: () => fetchSOSCalls(params) });
}

export function useUpdateSOSCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Parameters<typeof updateSOSCall>[1]) => updateSOSCall(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sos-calls"] }); qc.invalidateQueries({ queryKey: ["resident-service-stats"] }); },
  });
}

export function useResidentServiceStats() {
  return useQuery({ queryKey: ["resident-service-stats"], queryFn: fetchResidentServiceStats, refetchInterval: 30_000 });
}
