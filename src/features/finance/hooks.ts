import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInvoices, createInvoice, updateInvoice, fetchPayrollRecords, fetchFinanceStats } from "./api";
import type { Database } from "@/lib/db";

type InvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];
type InvoiceUpdate = Database["public"]["Tables"]["invoices"]["Update"];

export function useInvoices(params: { status?: string; client_id?: string } = {}) {
  return useQuery({ queryKey: ["invoices", params], queryFn: () => fetchInvoices(params) });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: InvoiceInsert) => createInvoice(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); qc.invalidateQueries({ queryKey: ["finance-stats"] }); },
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & InvoiceUpdate) => updateInvoice(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); qc.invalidateQueries({ queryKey: ["finance-stats"] }); },
  });
}

export function usePayrollRecords(params: { period?: string; status?: string } = {}) {
  return useQuery({ queryKey: ["payroll-records", params], queryFn: () => fetchPayrollRecords(params) });
}

export function useFinanceStats() {
  return useQuery({ queryKey: ["finance-stats"], queryFn: fetchFinanceStats, refetchInterval: 60_000 });
}
