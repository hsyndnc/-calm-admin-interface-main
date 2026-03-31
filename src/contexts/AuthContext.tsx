import { createContext, useContext, useState } from "react";

interface User {
  fullName: string;
  email: string;
  roles: string[];
  customerId: string | null;
  supplierId: number | null;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (
    token: string,
    fullName: string,
    email: string,
    roles: string[],
    customerId?: string | null,
    supplierId?: number | null,
  ) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: () => boolean;
  isCustomer: () => boolean;
  isSupplier: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (
    newToken: string,
    fullName: string,
    email: string,
    roles: string[],
    customerId: string | null = null,
    supplierId: number | null = null,
  ) => {
    const userData: User = { fullName, email, roles, customerId, supplierId };
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => user?.roles?.includes("Admin") ?? false;
  const isCustomer = () => user?.roles?.includes("Customer") ?? false;
  const isSupplier = () => user?.roles?.includes("Supplier") ?? false;

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, isAuthenticated: !!token, isAdmin, isCustomer, isSupplier }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
