import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  apiLogin,
  apiRegister,
  apiAdminLogin,
  apiLogout,
  apiGetCurrentUser,
  getStoredUser,
  getToken,
  type ApiUser,
} from "@/lib/api";

type UserRole = "user" | "admin" | null;

interface User {
  id: string;
  email?: string;
  user_metadata?: { name?: string };
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInAsAdmin: (adminCode: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapApiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    user_metadata: { name: apiUser.name },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const token = getToken();
    if (token) {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(mapApiUserToUser(storedUser));
        setUserRole(storedUser.role);
      }
      // Verify token is still valid
      apiGetCurrentUser().then((apiUser) => {
        if (apiUser) {
          setUser(mapApiUserToUser(apiUser));
          setUserRole(apiUser.role);
        } else {
          // Token expired
          apiLogout();
          setUser(null);
          setUserRole(null);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const data = await apiRegister(name || email.split("@")[0], email, password);
      setUser(mapApiUserToUser(data));
      setUserRole(data.role);
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || "Registration failed") };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiLogin(email, password);
      setUser(mapApiUserToUser(data));
      setUserRole(data.role);
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || "Login failed") };
    }
  };

  const signInAsAdmin = async (adminCode: string) => {
    try {
      const data = await apiAdminLogin(adminCode);
      setUser(mapApiUserToUser(data));
      setUserRole("admin");
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message || "Admin login failed") };
    }
  };

  const signOut = async () => {
    apiLogout();
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        signUp,
        signIn,
        signOut,
        signInAsAdmin,
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
