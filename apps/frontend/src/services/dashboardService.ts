import type { DashboardSummary } from "@show-booking/types";
import { api } from "./api";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>("/dashboard/summary");
  return response.data;
}
