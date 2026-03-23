export function AuthError({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
      {message}
    </div>
  );
}
