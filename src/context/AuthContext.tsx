import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthState } from '../types/auth.ts';

interface AuthContextType extends AuthState {
  login: (email: string, role?: UserRole) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (data: { email: string; fullName: string; role: UserRole; section?: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const AUTH_STORAGE_KEY = 'thinkfirst_auth_user';

// Default seeded educator for demonstration
const DEFAULT_TEACHER: User = {
  id: 'teacher-reyes',
  email: 'elena.reyes@school.edu',
  fullName: 'Ms. Elena Reyes',
  role: 'teacher',
  schoolOrOrg: 'Heritage Academy',
  createdAt: Date.now() - 86400000 * 30
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, roleOverride?: UserRole) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: roleOverride })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setIsLoading(false);
        return { success: true, user: data.user };
      } else {
        // Fallback for offline / instant demo
        const fallbackUser: User = {
          id: `usr-${Date.now()}`,
          email,
          fullName: email.includes('reyes') ? 'Ms. Elena Reyes' : email.split('@')[0],
          role: roleOverride || (email.includes('teacher') ? 'teacher' : 'student'),
          createdAt: Date.now()
        };
        setUser(fallbackUser);
        setIsLoading(false);
        return { success: true, user: fallbackUser };
      }
    } catch {
      const fallbackUser: User = {
        id: `usr-${Date.now()}`,
        email,
        fullName: email.split('@')[0],
        role: roleOverride || 'student',
        createdAt: Date.now()
      };
      setUser(fallbackUser);
      setIsLoading(false);
      return { success: true, user: fallbackUser };
    }
  };

  const register = async (data: { email: string; fullName: string; role: UserRole; section?: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (res.ok && resData.user) {
        setUser(resData.user);
        setIsLoading(false);
        return { success: true, user: resData.user };
      } else {
        const newUser: User = {
          id: `usr-${Date.now()}`,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          section: data.section,
          createdAt: Date.now()
        };
        setUser(newUser);
        setIsLoading(false);
        return { success: true, user: newUser };
      }
    } catch {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        section: data.section,
        createdAt: Date.now()
      };
      setUser(newUser);
      setIsLoading(false);
      return { success: true, user: newUser };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchRole = (newRole: UserRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    } else {
      setUser({
        id: `usr-${Date.now()}`,
        email: newRole === 'teacher' ? 'elena.reyes@school.edu' : 'student@school.edu',
        fullName: newRole === 'teacher' ? 'Ms. Elena Reyes' : 'Student Learner',
        role: newRole,
        createdAt: Date.now()
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
