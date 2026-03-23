import axios, { type AxiosError } from "axios";

import type { ApiEnvelope, ApiErrorEnvelope } from "@/types";

export function unwrapApiData<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success) {
    const firstError = envelope.errors?.[0];
    throw new Error(firstError || envelope.message || "Request failed");
  }

  if (envelope.data == null) {
    throw new Error("Empty response");
  }

  return envelope.data;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<ApiErrorEnvelope>).response?.data;
    if (data && data.success === false) {
      return data.errors?.[0] || data.message || "Request failed";
    }

    return error.message || "Network error";
  }

  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
