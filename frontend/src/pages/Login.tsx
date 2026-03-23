import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import * as authApi from "@/api/auth.api";
import { getErrorMessage } from "@/api/envelope";
import { AuthError } from "@/components/auth/AuthError";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField } from "@/components/auth/AuthField";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { useAuth } from "@/context/AuthContext";

type LocationState = { from?: { pathname?: string } };

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirectTo = useMemo(() => {
    const state = location.state as LocationState | null;
    return state?.from?.pathname || "/dashboard";
  }, [location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await authApi.login({ email, password });
      login({
        user: {
          _id: res._id,
          name: res.name,
          email: res.email,
          avatar: res.avatar,
        },
        accessToken: res.accessToken,
      });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to your LinkVault and pick up where you left off."
    >
      <div className="grid gap-4">
        <OAuthButtons />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <AuthField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isSubmitting}
          />
          <AuthField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isSubmitting}
          />

          {error ? <AuthError message={error} /> : null}

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-sm text-muted-foreground">
          New here?{" "}
          <Link
            className="text-foreground underline underline-offset-4"
            to="/register"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
