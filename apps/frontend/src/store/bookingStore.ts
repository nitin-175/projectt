import type { ShowTimingSummary } from "@show-booking/types";
import { create } from "zustand";

type SelectedSeat = {
  id: number;
  label: string;
};

type BookingDraft = {
  showId: number;
  showTitle: string;
  showTimingId: number;
  timing: ShowTimingSummary;
  seats: SelectedSeat[];
};

type BookingStoreState = {
  draft: BookingDraft | null;
  setDraft: (draft: BookingDraft) => void;
  clearDraft: () => void;
};

export const useBookingStore = create<BookingStoreState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));
