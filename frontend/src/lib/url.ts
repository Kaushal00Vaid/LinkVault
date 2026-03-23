export function safeOpenUrl(url: string) {
  try {
    // basic guard against empty/invalid values
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    // ignore
  }
}
