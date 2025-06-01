// oteam/frontend/services/auth.service.ts
import api from './api'; // Your existing Axios instance
import { Role } from '@/lib/types'; // Your frontend Role enum

// Mirror backend DTOs for type safety (or use a shared types package later)
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roles?: Role[]; // Optional: for admin creating users or specific registration flows
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
  organizationId?: string; // Add if your backend returns this and it's useful
  // ... any other fields your backend /auth/profile returns for the user object
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    // Assumes JWT is already set in api.defaults.headers.common['Authorization'] by AuthContext
    const response = await api.get<UserProfile>('/auth/profile');
    return response.data;
  },
};