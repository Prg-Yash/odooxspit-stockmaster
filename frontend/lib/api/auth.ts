/**
 * Auth API Service
 * Handles authentication-related API requests
 */

import { api } from '../api-client';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'owner' | 'manager' | 'staff';
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  emailVerified: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    name: string | null;
  };
}

/**
 * Login user
 */
export async function login(data: LoginData): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', data);
  
  // Store tokens in cookies (browser will handle this automatically via Set-Cookie header)
  // But also store in cookies manually for client-side access
  if (response.data.accessToken) {
    document.cookie = `accessToken=${response.data.accessToken}; path=/; max-age=${15 * 60}`; // 15 minutes
  }
  
  return response;
}

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<RegisterResponse> {
  return api.post<RegisterResponse>('/auth/register', data);
}

/**
 * Logout user
 */
export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    // Clear cookies
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

/**
 * Refresh access token
 */
export async function refreshToken() {
  return api.post<LoginResponse>('/auth/refresh-token');
}
