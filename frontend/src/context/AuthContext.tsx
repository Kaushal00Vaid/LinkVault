import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { authTokenStore } from "@/context/authTokenStore";
import type { User } from "@/types";

export type AuthUser = Pick<User, "_id" | "name" | "email" | "avatar">;

export type AuthLoginPayload = {
  user: AuthUser;
  accessToken: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (payload: AuthLoginPayload) => void;
  logout: () => void;
  setAccessToken: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function useAccessTokenFromStore() {
  return useSyncExternalStore(
    authTokenStore.subscribe,
    authTokenStore.get,
    authTokenStore.get,
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const accessToken = useAccessTokenFromStore();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!accessToken && user) setUser(null);
  }, [accessToken, user]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      login: ({ user, accessToken }) => {
        setUser(user);
        authTokenStore.set(accessToken);
      },
      logout: () => {
        setUser(null);
        authTokenStore.clear();
      },
      setAccessToken: (token) => {
        authTokenStore.set(token);
      },
    };
  }, [accessToken, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
