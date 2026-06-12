import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "super_admin" | "hod" | "staff" | "student";

export interface User {
  user_id: string;
  college_id: string;
  role: UserRole;
  email: string;
  name: string;
  department?: string;
  student_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call backend API
    const mockUsers: User[] = [
      {
        user_id: "sa1",
        college_id: "all",
        role: "super_admin",
        email: "admin@system.com",
        name: "System Admin",
      },
      {
        user_id: "hod1",
        college_id: "clg1",
        role: "hod",
        email: "hod@college1.com",
        name: "Dr. Rajesh Kumar",
        department: "Computer Science",
      },
      {
        user_id: "staff1",
        college_id: "clg1",
        role: "staff",
        email: "staff@college1.com",
        name: "Prof. Priya Sharma",
        department: "Computer Science",
      },
      {
        user_id: "student1",
        college_id: "clg1",
        role: "student",
        email: "student@college1.com",
        name: "Arjun Patel",
        department: "Computer Science",
        student_id: "std1",
      },
    ];

    const foundUser = mockUsers.find((u) => u.email === email && password === "password");
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
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
