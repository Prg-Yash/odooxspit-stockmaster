/**
 * Product API Service
 * Handles all product-related API requests
 */

import { api } from '../api-client';

export interface ProductCategory {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductCategoryData {
    name: string;
    description?: string;
}

export interface UpdateProductCategoryData {
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    description?: string;
    categoryId?: string;
    warehouseId: string;
    reorderLevel: number;
    price?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    category?: ProductCategory;
    warehouse?: {
        id: string;
        name: string;
        code: string;
    };
    stockLevels?: StockLevel[];
    _count?: {
        stockLevels: number;
    };
}

export interface StockLevel {
    id: string;
    productId: string;
    locationId: string;
    quantity: number;
    location?: {
        id: string;
        name: string;
        type: string;
    };
}

export interface CreateProductData {
    name: string;
    sku: string;
    description?: string;
    categoryId?: string;
    reorderLevel?: number;
    price?: number;
}

export interface UpdateProductData {
    name?: string;
    sku?: string;
    description?: string;
    categoryId?: string;
    reorderLevel?: number;
    price?: number;
    isActive?: boolean;
}

export interface ProductFilters {
    includeInactive?: boolean;
    categoryId?: string;
    search?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ProductStockSummary {
    product: Product;
    totalStock: number;
    isLowStock: boolean;
    stockByLocation: StockLevel[];
}

// ==================== PRODUCT CATEGORY APIs ====================

/**
 * Create a new product category
 */
export async function createProductCategory(data: CreateProductCategoryData) {
    return api.post<ApiResponse<ProductCategory>>(
        '/products/categories',
        data
    );
}

/**
 * Get all product categories
 */
export async function getProductCategories() {
    return api.get<ApiResponse<ProductCategory[]>>(
        '/products/categories'
    );
}

/**
 * Get a specific product category by ID
 */
export async function getProductCategory(categoryId: string) {
    return api.get<ApiResponse<ProductCategory>>(
        `/products/categories/${categoryId}`
    );
}

/**
 * Update a product category
 */
export async function updateProductCategory(
    categoryId: string,
    data: UpdateProductCategoryData
) {
    return api.put<ApiResponse<ProductCategory>>(
        `/products/categories/${categoryId}`,
        data
    );
}

/**
 * Delete a product category
 */
export async function deleteProductCategory(categoryId: string) {
    return api.delete<ApiResponse<null>>(
        `/products/categories/${categoryId}`
    );
}

// ==================== PRODUCT APIs ====================

/**
 * Create a new product in a warehouse
 */
export async function createProduct(
    warehouseId: string,
    data: CreateProductData
) {
    return api.post<ApiResponse<Product>>(
        `/products/warehouse/${warehouseId}`,
        data
    );
}

/**
 * Get all products in a warehouse
 */
export async function getProducts(
    warehouseId: string,
    filters?: ProductFilters
) {
    const params = new URLSearchParams();

    if (filters?.includeInactive) {
        params.append('includeInactive', 'true');
    }
    if (filters?.categoryId) {
        params.append('categoryId', filters.categoryId);
    }
    if (filters?.search) {
        params.append('search', filters.search);
    }

    const queryString = params.toString();
    const endpoint = `/products/warehouse/${warehouseId}${queryString ? `?${queryString}` : ''}`;

    return api.get<ApiResponse<Product[]>>(endpoint);
}

/**
 * Get a specific product by ID
 */
export async function getProduct(productId: string) {
    return api.get<ApiResponse<Product>>(
        `/products/${productId}`
    );
}

/**
 * Update a product
 */
export async function updateProduct(
    productId: string,
    data: UpdateProductData
) {
    return api.put<ApiResponse<Product>>(
        `/products/${productId}`,
        data
    );
}

/**
 * Delete a product (soft delete)
 */
export async function deleteProduct(productId: string) {
    return api.delete<ApiResponse<null>>(
        `/products/${productId}`
    );
}

/**
 * Get low stock products in a warehouse
 */
export async function getLowStockProducts(warehouseId: string) {
    return api.get<ApiResponse<Product[]>>(
        `/products/warehouse/${warehouseId}/low-stock`
    );
}

/**
 * Get product stock summary
 */
export async function getProductStockSummary(productId: string) {
    return api.get<ApiResponse<ProductStockSummary>>(
        `/products/${productId}/stock-summary`
    );
}
