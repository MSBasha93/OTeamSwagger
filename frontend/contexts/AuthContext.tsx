"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/services/api'; // We'll create this
import { Role } from '@/lib/types'; // We'll create this

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  hasRole: (roleOrRoles: Role | Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Check for existing token

  useEffect(() => {
    const storedToken = localStorage.getItem('oteam_token');
    const storedUser = localStorage.getItem('oteam_user');
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('oteam_token');
        localStorage.removeItem('oteam_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('oteam_token', newToken);
    localStorage.setItem('oteam_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem('oteam_token');
    localStorage.removeItem('oteam_user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    // Optionally redirect to login page
    window.location.href = '/login';
  };

  const hasRole = (roleOrRoles: Role | Role[]): boolean => {
    if (!user) return false;
    const rolesToCheck = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    return user.roles.some(userRole => rolesToCheck.includes(userRole));
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};