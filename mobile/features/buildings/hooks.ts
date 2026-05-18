import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBuildings,
  fetchBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  type BuildingListParams,
  type CreateBuildingInput,
} from "./api";

export const BUILDINGS_KEY = ["buildings"] as const;

export function useBuildings(params: BuildingListParams = {}) {
  return useQuery({
    queryKey: [...BUILDINGS_KEY, params],
    queryFn: () => fetchBuildings(params),
    staleTime: 30_000,
  });
}

export function useBuilding(id: string | null) {
  return useQuery({
    queryKey: [...BUILDINGS_KEY, id],
    queryFn: () => fetchBuildingById(id!),
    enabled: !!id,
  });
}

export function useCreateBuilding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBuildingInput) => createBuilding(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: BUILDINGS_KEY }),
  });
}

export function useUpdateBuilding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateBuildingInput> }) =>
      updateBuilding(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: BUILDINGS_KEY }),
  });
}

export function useDeleteBuilding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBuilding(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: BUILDINGS_KEY }),
  });
}

// Derived stats hook
export function useBuildingStats() {
  const { data, isLoading } = useBuildings({ limit: 1000 });
  const buildings = data?.data ?? [];

  return {
    isLoading,
    total: buildings.length,
    critical: buildings.filter((b) => b.status === "critical").length,
    warning: buildings.filter((b) => b.status === "warning").length,
    normal: buildings.filter((b) => b.status === "normal").length,
    avgSla: buildings.length
      ? Math.round(buildings.reduce((s, b) => s + b.sla_percent, 0) / buildings.length)
      : 0,
    totalStaffOnline: buildings.reduce((s, b) => s + b.staff_online, 0),
    totalStaff: buildings.reduce((s, b) => s + b.staff_total, 0),
    totalIncidents: buildings.reduce((s, b) => s + b.incidents_today, 0),
    totalCriticalIncidents: buildings.reduce((s, b) => s + b.critical_incidents, 0),
    buildings,
  };
}
