import { api } from "@/api/axios";
import { unwrapApiData } from "@/api/envelope";
import type { ApiEnvelope, User } from "@/types";

export type RegisterBody = {
  name: string;
  email: string;
  password: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type LoginResponse = Pick<User, "_id" | "name" | "email" | "avatar"> & {
  accessToken: string;
};

export async function register(body: RegisterBody) {
  const res = await api.post<ApiEnvelope<Pick<User, "_id" | "name" | "email">>>(
    "/auth/register",
    body,
  );
  return unwrapApiData(res.data);
}

export async function login(body: LoginBody) {
  const res = await api.post<ApiEnvelope<LoginResponse>>("/auth/login", body);
  return unwrapApiData(res.data);
}

export async function logout() {
  const res = await api.post<ApiEnvelope<null>>("/auth/logout");
  if (!res.data.success) {
    throw new Error(
      res.data.errors?.[0] || res.data.message || "Logout failed",
    );
  }
  return null;
}
