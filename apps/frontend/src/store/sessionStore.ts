import { create } from "zustand";
import type { AppRole } from "@show-booking/types";

const storageKey = "show-booking-session";

type SessionState = {
  token: string | null;
  roles: AppRole[];
  userName: string | null;
  email: string | null;
  venueIds: number[];
  setSession: (payload: { token: string; roles: AppRole[]; userName: string; email: string; venueIds: number[] }) => void;
  clearSession: () => void;
};

function readStoredSession() {
  if (typeof window === "undefined") {
    return { token: null, roles: [] as AppRole[], userName: null, email: null, venueIds: [] };
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return { token: null, roles: [] as AppRole[], userName: null, email: null, venueIds: [] };
  }

  try {
    return JSON.parse(raw) as Pick<SessionState, "token" | "roles" | "userName" | "email" | "venueIds">;
  } catch {
    return { token: null, roles: [] as AppRole[], userName: null, email: null, venueIds: [] };
  }
}

export const useSessionStore = create<SessionState>((set) => ({
  ...readStoredSession(),
  setSession: ({ token, roles, userName, email, venueIds }) => {
    const nextState = { token, roles, userName, email, venueIds };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(nextState));
    }
    set(nextState);
  },
  clearSession: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
    set({ token: null, roles: [], userName: null, email: null, venueIds: [] });
  },
}));
