import { createContext, ReactNode, useContext, useState } from "react";
import { User } from "../types/auth";

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  loginSuccess: (user: User, accessToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const loginSuccess = (nextUser: User, accessToken: string) => {
    localStorage.setItem("token", accessToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: user !== null, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  return ctx;
}
