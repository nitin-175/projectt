import type { SeatMapItem } from "@show-booking/types";
import { api } from "./api";

export async function getSeats(showTimingId: number) {
  const response = await api.get<SeatMapItem[]>(`/seats?showTimingId=${showTimingId}`);
  return response.data;
}
