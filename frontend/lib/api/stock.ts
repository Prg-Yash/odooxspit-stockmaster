/**
 * Stock API Client
 * Handles stock level and inventory management operations
 */

import { api } from "../api-client";

export interface StockLevel {
    id: string;
    productId: string;
    warehouseId: string;
    locationId: string;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    product: {
        id: string;
        name: string;
        sku: string;
        description?: string;
        reorderLevel?: number;
        maxStockLevel?: number;
        isActive: boolean;
    };
    location: {
        id: string;
        name: string;
        aisle?: string;
        rack?: string;
        shelf?: string;
        bin?: string;
    };
}

export interface StockAdjustment {
    productId: string;
    warehouseId: string;
    locationId: string;
    newQuantity: number;
    reason?: string;
    notes?: string;
}

export interface StockReceive {
    productId: string;
    locationId: string;
    quantity: number;
    reference?: string;
    notes?: string;
}

export interface StockDeliver {
    productId: string;
    locationId: string;
    quantity: number;
    reference?: string;
    notes?: string;
}

export interface LowStockAlert {
    product: {
        id: string;
        name: string;
        sku: string;
        reorderLevel?: number;
    };
    location: {
        id: string;
        name: string;
    };
    currentQuantity: number;
    reorderLevel: number;
    difference: number;
}

export interface WarehouseStockSummary {
    totalProducts: number;
    totalQuantity: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalValue: number;
}

/**
 * Get stock levels for a warehouse
 */
export async function getStockLevels(
    warehouseId: string,
    options?: {
        productId?: string;
        locationId?: string;
        includeZero?: boolean;
    }
) {
    const params = new URLSearchParams();
    if (options?.productId) params.append("productId", options.productId);
    if (options?.locationId) params.append("locationId", options.locationId);
    if (options?.includeZero !== undefined)
        params.append("includeZero", options.includeZero.toString());

    const queryString = params.toString();
    const endpoint = `/stocks/warehouse/${warehouseId}/levels${queryString ? `?${queryString}` : ""}`;

    return api.get<{ success: boolean; data: StockLevel[] }>(endpoint);
}

/**
 * Receive stock (increase inventory)
 */
export async function receiveStock(warehouseId: string, data: StockReceive) {
    return api.post(`/stocks/warehouse/${warehouseId}/receive`, data);
}

/**
 * Deliver stock (decrease inventory)
 */
export async function deliverStock(warehouseId: string, data: StockDeliver) {
    return api.post(`/stocks/warehouse/${warehouseId}/deliver`, data);
}

/**
 * Adjust stock to specific quantity
 */
export async function adjustStock(data: StockAdjustment) {
    return api.post("/stocks/adjust", data);
}

/**
 * Get low stock alerts
 */
export async function getLowStockAlerts(warehouseId: string) {
    return api.get<{ success: boolean; data: LowStockAlert[] }>(
        `/stocks/warehouse/${warehouseId}/alerts`
    );
}

/**
 * Get warehouse stock summary
 */
export async function getWarehouseStockSummary(warehouseId: string) {
    return api.get<{ success: boolean; data: WarehouseStockSummary }>(
        `/stocks/warehouse/${warehouseId}/summary`
    );
}
