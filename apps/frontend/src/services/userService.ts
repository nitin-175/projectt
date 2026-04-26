import type { VenueSummary } from "@show-booking/types";
import type { AuthPayload } from "@show-booking/types";
import { api } from "./api";

export type UserSummary = {
  id: number;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
  organizerVenues: VenueSummary[];
};

export async function getUsers(): Promise<UserSummary[]> {
  const response = await api.get<UserSummary[]>("/admin/users");
  return response.data;
}

export async function provisionUser(user: { name: string; email: string; password?: string }): Promise<UserSummary> {
  const response = await api.post<UserSummary>("/admin/users", user);
  return response.data;
}

export async function updateUserRoles(userId: number, roles: string[], venueIds: number[] = []): Promise<UserSummary> {
  const response = await api.put<UserSummary>(`/admin/users/${userId}/roles`, { roles, venueIds });
  return response.data;
}

export async function updateMyProfile(payload: {
  name: string;
  email: string;
  currentPassword: string;
  newPassword?: string;
}): Promise<AuthPayload> {
  const response = await api.put<AuthPayload>("/users/me", payload);
  return response.data;
}

export async function deleteMyProfile(currentPassword: string): Promise<void> {
  await api.delete("/users/me", {
    data: { currentPassword },
  });
}
