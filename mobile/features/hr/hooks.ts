import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEmployees, createEmployee, updateEmployee, deleteEmployee,
  fetchCertifications, fetchLeaveRequests, updateLeaveRequest, fetchHRStats,
  type EmployeeListParams,
} from "./api";
import type { Database } from "../../lib/db";

type EmployeeInsert = Database["public"]["Tables"]["employees"]["Insert"];
type EmployeeUpdate = Database["public"]["Tables"]["employees"]["Update"];
type LeaveUpdate = Database["public"]["Tables"]["leave_requests"]["Update"];

export function useEmployees(params: EmployeeListParams = {}) {
  return useQuery({ queryKey: ["employees", params], queryFn: () => fetchEmployees(params) });
}

export function useHRStats() {
  return useQuery({ queryKey: ["hr-stats"], queryFn: fetchHRStats, refetchInterval: 60_000 });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: EmployeeInsert) => createEmployee(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); qc.invalidateQueries({ queryKey: ["hr-stats"] }); },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & EmployeeUpdate) => updateEmployee(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["employees"] }); qc.invalidateQueries({ queryKey: ["hr-stats"] }); },
  });
}

export function useCertifications(params: { employee_id?: string } = {}) {
  return useQuery({ queryKey: ["certifications", params], queryFn: () => fetchCertifications(params) });
}

export function useLeaveRequests(params: { status?: string } = {}) {
  return useQuery({ queryKey: ["leave-requests", params], queryFn: () => fetchLeaveRequests(params) });
}

export function useUpdateLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & LeaveUpdate) => updateLeaveRequest(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leave-requests"] }); qc.invalidateQueries({ queryKey: ["hr-stats"] }); },
  });
}
