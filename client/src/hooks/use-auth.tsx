import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  nome: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  const isAuthenticated = !!user;
  const isAdmin = !!user?.isAdmin;

  // Função para verificar o status de autenticação
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest<{
        authenticated: boolean;
        user: User | null;
      }>({
        url: "/api/auth/status",
        method: "GET",
      });

      if (response && response.authenticated) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Verifica o status de autenticação ao iniciar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Função de login
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<{
        success: boolean;
        user: User;
      }>({
        url: "/api/auth/login",
        method: "POST",
        data: { username, password },
      });

      if (response && response.user) {
        setUser(response.user);
        navigate("/");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await apiRequest<{ success: boolean }>({
        url: "/api/auth/logout",
        method: "POST",
      });
      
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isAdmin,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}