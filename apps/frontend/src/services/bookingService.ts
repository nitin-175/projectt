import type { BookingSummary, CreateBookingRequest } from "@show-booking/types";
import { api } from "./api";

export async function getMyBookings() {
  const response = await api.get<BookingSummary[]>("/bookings/user");
  return response.data;
}

export async function createBooking(request: CreateBookingRequest) {
  const response = await api.post<BookingSummary>("/bookings", request);
  return response.data;
}
