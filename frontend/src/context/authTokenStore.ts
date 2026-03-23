type Listener = () => void;

let accessToken: string | null = null;
const listeners = new Set<Listener>();

export const authTokenStore = {
  get(): string | null {
    return accessToken;
  },
  set(token: string | null) {
    accessToken = token;
    for (const listener of listeners) listener();
  },
  clear() {
    accessToken = null;
    for (const listener of listeners) listener();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
