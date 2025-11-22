import { prisma } from "../lib/prisma";
import type {
    CreateProductDto,
    UpdateProductDto,
    CreateProductCategoryDto,
    UpdateProductCategoryDto,
} from "../types/product.types";

export class ProductService {
    /**
     * Create product category
     */
    async createCategory(data: CreateProductCategoryDto) {
        return await prisma.productCategory.create({
            data,
        });
    }

    /**
     * Get all categories
     */
    async getCategories() {
        return await prisma.productCategory.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: { name: "asc" },
        });
    }

    /**
     * Get category by ID
     */
    async getCategoryById(id: string) {
        return await prisma.productCategory.findUnique({
            where: { id },
            include: {
                products: {
                    where: { isActive: true },
                },
            },
        });
    }

    /**
     * Update category
     */
    async updateCategory(id: string, data: UpdateProductCategoryDto) {
        return await prisma.productCategory.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete category
     */
    async deleteCategory(id: string) {
        // Check if category has products
        const productCount = await prisma.product.count({
            where: { categoryId: id },
        });

        if (productCount > 0) {
            throw new Error(
                "Cannot delete category with existing products. Please reassign products first."
            );
        }

        return await prisma.productCategory.delete({
            where: { id },
        });
    }

    /**
     * Create product
     */
    async createProduct(warehouseId: string, data: CreateProductDto) {
        // Check if SKU already exists in this warehouse
        const existing = await prisma.product.findUnique({
            where: {
                warehouseId_sku: {
                    warehouseId,
                    sku: data.sku,
                },
            },
        });

        if (existing) {
            const error: any = new Error("Product with this SKU already exists in this warehouse");
            error.code = "DUPLICATE_SKU";
            throw error;
        }

        // Validate category if provided
        if (data.categoryId) {
            const category = await prisma.productCategory.findUnique({
                where: { id: data.categoryId },
            });

            if (!category) {
                throw new Error("Category not found");
            }
        }

        return await prisma.product.create({
            data: {
                ...data,
                warehouseId,
            },
            include: {
                category: true,
                warehouse: true,
            },
        });
    }

    /**
     * Get products in warehouse
     */
    async getProductsByWarehouse(
        warehouseId: string,
        options?: {
            includeInactive?: boolean;
            categoryId?: string;
            search?: string;
        }
    ) {
        const where: any = {
            warehouseId,
        };

        if (!options?.includeInactive) {
            where.isActive = true;
        }

        if (options?.categoryId) {
            where.categoryId = options.categoryId;
        }

        if (options?.search) {
            where.OR = [
                { name: { contains: options.search, mode: "insensitive" } },
                { sku: { contains: options.search, mode: "insensitive" } },
                { description: { contains: options.search, mode: "insensitive" } },
            ];
        }

        return await prisma.product.findMany({
            where,
            include: {
                category: true,
                _count: {
                    select: {
                        stockLevels: true,
                    },
                },
            },
            orderBy: { name: "asc" },
        });
    }

    /**
     * Get product by ID
     */
    async getProductById(id: string) {
        return await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                warehouse: true,
                stockLevels: {
                    include: {
                        location: true,
                    },
                },
            },
        });
    }

    /**
     * Update product
     */
    async updateProduct(id: string, data: UpdateProductDto) {
        // Validate category if being updated
        if (data.categoryId !== undefined && data.categoryId !== null) {
            const category = await prisma.productCategory.findUnique({
                where: { id: data.categoryId },
            });

            if (!category) {
                throw new Error("Category not found");
            }
        }

        return await prisma.product.update({
            where: { id },
            data,
            include: {
                category: true,
                warehouse: true,
            },
        });
    }

    /**
     * Soft delete product (set isActive to false)
     */
    async deleteProduct(id: string) {
        return await prisma.product.update({
            where: { id },
            data: { isActive: false },
        });
    }

    /**
     * Get products with low stock
     */
    async getLowStockProducts(warehouseId: string) {
        const products = await prisma.product.findMany({
            where: {
                warehouseId,
                isActive: true,
                reorderLevel: {
                    gt: 0,
                },
            },
            include: {
                category: true,
                stockLevels: {
                    include: {
                        location: true,
                    },
                },
            },
        });

        // Filter products where total stock is below reorder level
        return products.filter((product) => {
            const totalStock = product.stockLevels.reduce(
                (sum, level) => sum + level.quantity,
                0
            );
            return totalStock <= product.reorderLevel;
        });
    }

    /**
     * Get product stock summary
     */
    async getProductStockSummary(productId: string) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                stockLevels: {
                    include: {
                        location: true,
                    },
                },
            },
        });

        if (!product) {
            throw new Error("Product not found");
        }

        const totalStock = product.stockLevels.reduce(
            (sum, level) => sum + level.quantity,
            0
        );

        return {
            product,
            totalStock,
            isLowStock: product.reorderLevel > 0 && totalStock <= product.reorderLevel,
            stockByLocation: product.stockLevels,
        };
    }
}
