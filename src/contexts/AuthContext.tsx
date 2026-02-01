import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi, type User } from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    business_name: string;
    business_address?: string;
    business_phone?: string;
    plan_id: string;
  }) => Promise<User>;
  registerCustomer: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const u = await authApi.getCurrentUser();
    setUser(u);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: u } = await authApi.login(email, password);
      setUser(u);
      return u;
    },
    []
  );

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
      business_name: string;
      business_address?: string;
      business_phone?: string;
      plan_id: string;
    }) => {
      const { user: u } = await authApi.register(data);
      setUser(u);
      return u;
    },
    []
  );

  const registerCustomer = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => {
      const { user: u } = await authApi.registerCustomer(data);
      setUser(u);
      return u;
    },
    []
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, registerCustomer, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
