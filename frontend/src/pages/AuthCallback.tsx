import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { decodeJwtPayload } from "@/lib/jwt";

type JwtPayload = {
  sub?: string;
  _id?: string;
  id?: string;
  email?: string;
  name?: string;
  avatar?: string;
};

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, setAccessToken } = useAuth();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("accessToken");

    if (!token) {
      setError("Missing access token. Please try logging in again.");
      return;
    }

    const payload = decodeJwtPayload<JwtPayload>(token);

    const maybeUser: AuthUser | null = payload
      ? {
          _id: payload._id || payload.id || payload.sub || "",
          name: payload.name || "",
          email: payload.email || "",
          avatar: payload.avatar,
        }
      : null;

    if (maybeUser && (maybeUser._id || maybeUser.email || maybeUser.name)) {
      login({ user: maybeUser, accessToken: token });
    } else {
      setAccessToken(token);
    }

    window.history.replaceState({}, document.title, "/auth/callback");
    navigate("/dashboard", { replace: true });
  }, [login, navigate, params, setAccessToken]);

  if (error) {
    return (
      <AuthCard title="OAuth failed" subtitle={error}>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-95"
          onClick={() => navigate("/login", { replace: true })}
        >
          Back to login
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Signing you in…" subtitle="Finishing authentication." />
  );
}
