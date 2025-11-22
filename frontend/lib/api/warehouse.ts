/**
 * Warehouse API Service
 * Handles all warehouse-related API requests
 */

import { api } from '../api-client';

export interface CreateWarehouseData {
  name: string;
  code: string;
  capacity?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  capacity?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddMemberData {
  userId: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
}

export interface WarehouseMember {
  id: string;
  warehouseId: string;
  userId: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Create a new warehouse
 */
export async function createWarehouse(data: CreateWarehouseData) {
  return api.post<ApiResponse<{ warehouse: Warehouse }>>(
    '/warehouses',
    data
  );
}

/**
 * Get all warehouses for the current user
 */
export async function getWarehouses() {
  return api.get<ApiResponse<{ warehouses: Warehouse[] }>>(
    '/warehouses'
  );
}

/**
 * Get a specific warehouse by ID
 */
export async function getWarehouse(warehouseId: string) {
  return api.get<ApiResponse<{ warehouse: Warehouse }>>(
    `/warehouses/${warehouseId}`
  );
}

/**
 * Update warehouse details
 */
export async function updateWarehouse(
  warehouseId: string,
  data: Partial<CreateWarehouseData> & { isActive?: boolean }
) {
  return api.put<ApiResponse<{ warehouse: Warehouse }>>(
    `/warehouses/${warehouseId}`,
    data
  );
}

/**
 * Delete a warehouse
 */
export async function deleteWarehouse(warehouseId: string) {
  return api.delete<ApiResponse<null>>(
    `/warehouses/${warehouseId}`
  );
}

/**
 * Get all members of a warehouse
 */
export async function getWarehouseMembers(warehouseId: string) {
  return api.get<ApiResponse<{ members: WarehouseMember[] }>>(
    `/warehouses/${warehouseId}/members`
  );
}

/**
 * Add a member to a warehouse
 */
export async function addWarehouseMember(
  warehouseId: string,
  data: AddMemberData
) {
  return api.post<ApiResponse<{ member: WarehouseMember }>>(
    `/warehouses/${warehouseId}/members`,
    data
  );
}

/**
 * Update a warehouse member's role
 */
export async function updateWarehouseMember(
  warehouseId: string,
  userId: string,
  role: 'MANAGER' | 'STAFF'
) {
  return api.put<ApiResponse<{ member: WarehouseMember }>>(
    `/warehouses/${warehouseId}/members/${userId}`,
    { role }
  );
}

/**
 * Remove a member from a warehouse
 */
export async function removeWarehouseMember(
  warehouseId: string,
  userId: string
) {
  return api.delete<ApiResponse<null>>(
    `/warehouses/${warehouseId}/members/${userId}`
  );
}
