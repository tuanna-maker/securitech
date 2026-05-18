import { useQuery } from "@tanstack/react-query";
import { fetchReportOverview, fetchReportFinance, fetchReportCustomers } from "./api";

export function useReportOverview() {
  return useQuery({ queryKey: ["report-overview"], queryFn: fetchReportOverview });
}

export function useReportFinance() {
  return useQuery({ queryKey: ["report-finance"], queryFn: fetchReportFinance });
}

export function useReportCustomers() {
  return useQuery({ queryKey: ["report-customers"], queryFn: fetchReportCustomers });
}
