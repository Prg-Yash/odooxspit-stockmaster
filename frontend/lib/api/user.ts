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
  createdAt?: string;
  warehouseMemberships?: {
    id: string;
    role: 'OWNER' | 'MANAGER' | 'STAFF';
    warehouse: {
      id: string;
      name: string;
      code: string;
      city?: string;
      state?: string;
    };
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

/**
 * Get all employees with warehouse assignments (OWNER only)
 */
export async function getAllEmployees() {
  return api.get<ApiResponse<{ employees: User[] }>>(
    '/user/employees'
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
