import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User } from "../types/auth";
import { logout as logoutRequest } from "../apis/auth/auth";
import { AUTH_LOGOUT_EVENT, invalidateSession, refreshAccessToken } from "../apis/axiosInstance";

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isRestoring: boolean;
  loginSuccess: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readCachedUser(): User | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const loginSuccess = (nextUser: User, accessToken: string) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = async () => {
    invalidateSession();
    try {
      await logoutRequest();
    } finally {
      clearSession();
    }
  };

  useEffect(() => {
    const cachedUser = readCachedUser();
    if (!cachedUser) {
      setIsRestoring(false);
      return;
    }

    refreshAccessToken()
      .then(() => setUser(cachedUser))
      .catch(() => clearSession())
      .finally(() => setIsRestoring(false));
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_LOGOUT_EVENT, clearSession);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, clearSession);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: user !== null, isRestoring, loginSuccess, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  return ctx;
}
