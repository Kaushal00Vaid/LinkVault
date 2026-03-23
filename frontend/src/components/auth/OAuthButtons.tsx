import { OAUTH_GITHUB_URL, OAUTH_GOOGLE_URL } from "@/config/env";

export function OAuthButtons() {
  return (
    <div className="grid gap-2">
      <button
        type="button"
        className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted"
        onClick={() => {
          window.location.assign(OAUTH_GOOGLE_URL);
        }}
      >
        Continue with Google
      </button>
      <button
        type="button"
        className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted"
        onClick={() => {
          window.location.assign(OAUTH_GITHUB_URL);
        }}
      >
        Continue with GitHub
      </button>
    </div>
  );
}
