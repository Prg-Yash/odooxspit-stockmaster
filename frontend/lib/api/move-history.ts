/**
 * Move History API Service
 * Handles stock movement history-related API requests
 */

import { api } from '../api-client';

export interface StockMovement {
    id: string;
    productId: string;
    locationId: string;
    quantity: number;
    type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
    referenceId?: string;
    referenceType?: 'RECEIPT' | 'DELIVERY' | 'ADJUSTMENT' | 'TRANSFER';
    notes?: string;
    userId: string;
    warehouseId: string;
    createdAt: string;
    updatedAt: string;
    product?: {
        id: string;
        name: string;
        sku: string;
    };
    location?: {
        id: string;
        name: string;
        type: string;
    };
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface MovementFilters {
    productId?: string;
    warehouseId?: string;
    locationId?: string;
    type?: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    pagination?: {
        total: number;
        limit: number;
        offset: number;
    };
}

/**
 * Get stock movements with filters
 */
export async function getStockMovements(
    warehouseId: string,
    filters?: MovementFilters
) {
    const params = new URLSearchParams();

    if (filters?.productId) params.append('productId', filters.productId);
    if (filters?.locationId) params.append('locationId', filters.locationId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `/stock/movements/${warehouseId}${queryString ? `?${queryString}` : ''}`;

    return api.get<ApiResponse<StockMovement[]>>(endpoint);
}

/**
 * Get stock movements for a specific product
 */
export async function getProductMovements(
    warehouseId: string,
    productId: string,
    filters?: Omit<MovementFilters, 'productId'>
) {
    return getStockMovements(warehouseId, { ...filters, productId });
}
