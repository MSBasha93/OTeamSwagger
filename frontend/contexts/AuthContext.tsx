// oteam/frontend/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '@/services/api';
import { authService, UserProfile } from '@/services/auth.service'; // Import new service and type
import { Role } from '@/lib/types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean; // Indicates initial loading of auth state
  isAuthenticated: boolean; // Convenience boolean
  login: (token: string, userData: UserProfile) => void;
  logout: () => void;
  hasRole: (roleOrRoles: Role | Role[]) => boolean;
  fetchUserProfile: () => Promise<void>; // Allow manual re-fetch if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Initial check for token/user

  const loadAuthData = useCallback(async () => {
    setIsLoading(true);
    const storedToken = localStorage.getItem('oteam_token');
    if (storedToken) {
      setToken(storedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      try {
        const userProfile = await authService.getProfile();
        setUser(userProfile);
      } catch (error) {
        console.error("Failed to fetch profile with stored token, logging out:", error);
        // Token might be expired or invalid
        localStorage.removeItem('oteam_token');
        localStorage.removeItem('oteam_user'); // Remove any stale user data
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
      }
    }
    setIsLoading(false);
  }, []);


  useEffect(() => {
    loadAuthData();
  }, [loadAuthData]);

  const login = (newToken: string, userData: UserProfile) => {
    localStorage.setItem('oteam_token', newToken);
    // No need to store full user in localStorage if we re-fetch profile on load
    // or trust the userData from login response completely.
    // For simplicity, we'll use userData from login directly.
    // localStorage.setItem('oteam_user', JSON.stringify(userData)); 
    setToken(newToken);
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem('oteam_token');
    // localStorage.removeItem('oteam_user');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    // Redirect to login page, ensure it's client-side
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
  };

  const hasRole = (roleOrRoles: Role | Role[]): boolean => {
    if (!user) return false;
    const rolesToCheck = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    return user.roles.some(userRole => rolesToCheck.includes(userRole));
  };

  const fetchUserProfile = async () => {
    if(token){ // only if a token exists
      setIsLoading(true);
      try {
        const userProfile = await authService.getProfile();
        setUser(userProfile);
      } catch (error) {
        console.error("Error re-fetching user profile:", error);
        logout(); // If profile fetch fails, likely bad token, so log out
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <AuthContext.Provider value={{ 
        user, 
        token, 
        isLoading, 
        isAuthenticated: !!user, // True if user object exists
        login, 
        logout, 
        hasRole,
        fetchUserProfile 
    }}>
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