import type { VenueSummary } from "@show-booking/types";
import { api } from "./api";

export async function getVenues(): Promise<VenueSummary[]> {
  const response = await api.get<VenueSummary[]>("/venues");
  return response.data;
}

export async function createVenue(payload: Omit<VenueSummary, "id">): Promise<VenueSummary> {
  const response = await api.post<VenueSummary>("/venues", payload);
  return response.data;
}
