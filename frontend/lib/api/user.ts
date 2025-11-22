/**
 * User API Service
 * Handles user-related API requests
 */

import { api } from '../api-client';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  warehouseMemberships?: {
    warehouse: {
      id: string;
      name: string;
      code: string;
    };
    role: 'MANAGER' | 'STAFF';
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Search users by email
 */
export async function searchUsers(email: string) {
  return api.get<ApiResponse<{ users: User[] }>>(
    `/user/search?email=${encodeURIComponent(email)}`
  );
}

/**
 * Get current user profile
 */
export async function getCurrentUser() {
  return api.get<ApiResponse<{ user: User }>>(
    '/user/me'
  );
}

export interface UpdateProfileData {
  name?: string
  email?: string
  password?: string
  currentPassword?: string
}

/**
 * Update user profile (name, email, or password)
 */
export async function updateProfile(data: UpdateProfileData) {
  return api.put<ApiResponse<{ user: User }>>(
    '/user/update',
    data
  );
}
