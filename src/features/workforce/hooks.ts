import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchShifts, fetchPatrols, fetchCheckpoints, fetchStaffMembers, fetchWorkforceStats,
  createShift, deleteShift,
  createStaffMember, updateStaffMember, deleteStaffMember,
  createPatrolRoute, updatePatrolRoute, deletePatrolRoute,
  createCheckpoint, updateCheckpoint, deleteCheckpoint,
  type CreateStaffInput, type CreatePatrolInput,
} from "./api";

export function useShifts(params: { week_start?: string; building_id?: string } = {}) {
  return useQuery({ queryKey: ["shifts", params], queryFn: () => fetchShifts(params) });
}

export function usePatrols() {
  return useQuery({ queryKey: ["patrols"], queryFn: fetchPatrols });
}

export function useCheckpoints(routeId: string | null) {
  return useQuery({
    queryKey: ["checkpoints", routeId],
    queryFn: () => fetchCheckpoints(routeId!),
    enabled: !!routeId,
  });
}

export function useStaffMembers() {
  return useQuery({ queryKey: ["staff-members"], queryFn: fetchStaffMembers });
}

export function useWorkforceStats() {
  return useQuery({ queryKey: ["workforce-stats"], queryFn: fetchWorkforceStats, refetchInterval: 30_000 });
}

export function useCreateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createShift,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shifts"] });
      qc.invalidateQueries({ queryKey: ["workforce-stats"] });
    },
  });
}

export function useDeleteShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteShift,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shifts"] });
      qc.invalidateQueries({ queryKey: ["workforce-stats"] });
    },
  });
}

function invalidateStaff(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["staff-members"] });
  qc.invalidateQueries({ queryKey: ["workforce-stats"] });
}

export function useCreateStaffMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStaffInput) => createStaffMember(input),
    onSuccess: () => invalidateStaff(qc),
  });
}

export function useUpdateStaffMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<CreateStaffInput>) =>
      updateStaffMember(id, input),
    onSuccess: () => invalidateStaff(qc),
  });
}

export function useDeleteStaffMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStaffMember(id),
    onSuccess: () => invalidateStaff(qc),
  });
}

/* ── Patrols & Checkpoints ── */
function invalidatePatrols(qc: ReturnType<typeof useQueryClient>, routeId?: string | null) {
  qc.invalidateQueries({ queryKey: ["patrols"] });
  if (routeId) qc.invalidateQueries({ queryKey: ["checkpoints", routeId] });
}

export function useCreatePatrolRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePatrolInput) => createPatrolRoute(input),
    onSuccess: () => invalidatePatrols(qc),
  });
}

export function useUpdatePatrolRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Parameters<typeof updatePatrolRoute>[1]) => updatePatrolRoute(id, input),
    onSuccess: () => invalidatePatrols(qc),
  });
}

export function useDeletePatrolRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePatrolRoute(id),
    onSuccess: () => invalidatePatrols(qc),
  });
}

export function useCreateCheckpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { route_id: string; name: string; sequence_order?: number }) => createCheckpoint(input),
    onSuccess: (_d, vars) => invalidatePatrols(qc, vars.route_id),
  });
}

export function useUpdateCheckpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, route_id, ...input }: { id: string; route_id: string } & Parameters<typeof updateCheckpoint>[1]) => updateCheckpoint(id, input),
    onSuccess: (_d, vars) => invalidatePatrols(qc, vars.route_id),
  });
}

export function useDeleteCheckpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, route_id }: { id: string; route_id: string }) => deleteCheckpoint(id, route_id),
    onSuccess: (_d, vars) => invalidatePatrols(qc, vars.route_id),
  });
}
