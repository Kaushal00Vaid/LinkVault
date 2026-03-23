import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import * as authApi from "@/api/auth.api";
import { getErrorMessage } from "@/api/envelope";
import { AuthError } from "@/components/auth/AuthError";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthField } from "@/components/auth/AuthField";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.register({ name, email, password });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start building your external brain for dev docs."
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
            label="Name"
            name="name"
            value={name}
            onChange={setName}
            autoComplete="name"
            placeholder="Jane Developer"
            disabled={isSubmitting}
          />
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
            autoComplete="new-password"
            placeholder="Create a strong password"
            disabled={isSubmitting}
          />

          {error ? <AuthError message={error} /> : null}

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="text-foreground underline underline-offset-4"
            to="/login"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
