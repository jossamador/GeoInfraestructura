import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, clearToken, getToken, setToken, type AuthUser } from "./api";

export const DEMO_TOKEN = "demo-mode-token";

const demoUser: AuthUser = {
  id: "demo-user",
  name: "Invitado Demo",
  email: "demo@geolluvias.local",
  role: "viewer"
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  enterDemo: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(getToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (token === DEMO_TOKEN) {
        setUser(demoUser);
        setLoading(false);
        return;
      }

      try {
        const response = await api.me();
        setUser(response.profile);
      } catch {
        clearToken();
        setTokenState(null);
      } finally {
        setLoading(false);
      }
    };

    void hydrate();
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    setToken(response.token);
    setTokenState(response.token);
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await api.register({ name, email, password });
    setToken(response.token);
    setTokenState(response.token);
    setUser(response.user);
  };

  const enterDemo = () => {
    setToken(DEMO_TOKEN);
    setTokenState(DEMO_TOKEN);
    setUser(demoUser);
    setLoading(false);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, enterDemo, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
};
