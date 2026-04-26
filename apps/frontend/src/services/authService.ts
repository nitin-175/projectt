import type { AuthPayload } from "@show-booking/types";
import { api } from "./api";

type AuthRequest = {
  email: string;
  password: string;
};

type RegisterRequest = AuthRequest & {
  name: string;
};

export async function login(request: AuthRequest) {
  const response = await api.post<AuthPayload>("/auth/login", request);
  return response.data;
}

export async function register(request: RegisterRequest) {
  const response = await api.post<AuthPayload>("/auth/register", request);
  return response.data;
}
