import type { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import {
    createProductSchema,
    updateProductSchema,
    createProductCategorySchema,
    updateProductCategorySchema,
} from "../types/product.types";
import type { WarehouseAuthRequest } from "../middlewares/require-warehouse-role";

const productService = new ProductService();

export class ProductController {
    /**
     * Create product category
     */
    async createCategory(req: Request, res: Response) {
        try {
            const validatedData = createProductCategorySchema.parse(req.body);
            const category = await productService.createCategory(validatedData);

            return res.status(201).json({
                success: true,
                message: "Category created successfully",
                data: category,
            });
        } catch (error: any) {
            console.error("Create category error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to create category",
            });
        }
    }

    /**
     * Get all categories
     */
    async getCategories(req: Request, res: Response) {
        try {
            const categories = await productService.getCategories();

            return res.status(200).json({
                success: true,
                data: categories,
            });
        } catch (error: any) {
            console.error("Get categories error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch categories",
            });
        }
    }

    /**
     * Get category by ID
     */
    async getCategory(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            if (!categoryId) {
                return res.status(400).json({ success: false, message: "Category ID required" });
            }
            const category = await productService.getCategoryById(categoryId);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }

            return res.status(200).json({
                success: true,
                data: category,
            });
        } catch (error: any) {
            console.error("Get category error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch category",
            });
        }
    }

    /**
     * Update category
     */
    async updateCategory(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            if (!categoryId) {
                return res.status(400).json({ success: false, message: "Category ID required" });
            }
            const validatedData = updateProductCategorySchema.parse(req.body);

            const category = await productService.updateCategory(
                categoryId,
                validatedData
            );

            return res.status(200).json({
                success: true,
                message: "Category updated successfully",
                data: category,
            });
        } catch (error: any) {
            console.error("Update category error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to update category",
            });
        }
    }

    /**
     * Delete category
     */
    async deleteCategory(req: Request, res: Response) {
        try {
            const { categoryId } = req.params;
            if (!categoryId) {
                return res.status(400).json({ success: false, message: "Category ID required" });
            }
            await productService.deleteCategory(categoryId);

            return res.status(200).json({
                success: true,
                message: "Category deleted successfully",
            });
        } catch (error: any) {
            console.error("Delete category error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to delete category",
            });
        }
    }

    /**
     * Create product
     */
    async createProduct(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            const validatedData = createProductSchema.parse(req.body);

            const product = await productService.createProduct(
                warehouseId,
                validatedData
            );

            return res.status(201).json({
                success: true,
                message: "Product created successfully",
                data: product,
            });
        } catch (error: any) {
            console.error("Create product error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to create product",
            });
        }
    }

    /**
     * Get products in warehouse
     */
    async getProducts(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            const { includeInactive, categoryId, search } = req.query;

            const products = await productService.getProductsByWarehouse(
                warehouseId,
                {
                    includeInactive: includeInactive === "true",
                    categoryId: categoryId as string,
                    search: search as string,
                }
            );

            return res.status(200).json({
                success: true,
                data: products,
            });
        } catch (error: any) {
            console.error("Get products error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch products",
            });
        }
    }

    /**
     * Get product by ID
     */
    async getProduct(req: WarehouseAuthRequest, res: Response) {
        try {
            const { productId } = req.params;
            if (!productId) {
                return res.status(400).json({ success: false, message: "Product ID required" });
            }
            const product = await productService.getProductById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }

            return res.status(200).json({
                success: true,
                data: product,
            });
        } catch (error: any) {
            console.error("Get product error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch product",
            });
        }
    }

    /**
     * Update product
     */
    async updateProduct(req: WarehouseAuthRequest, res: Response) {
        try {
            const { productId } = req.params;
            if (!productId) {
                return res.status(400).json({ success: false, message: "Product ID required" });
            }
            const validatedData = updateProductSchema.parse(req.body);

            const product = await productService.updateProduct(
                productId,
                validatedData
            );

            return res.status(200).json({
                success: true,
                message: "Product updated successfully",
                data: product,
            });
        } catch (error: any) {
            console.error("Update product error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to update product",
            });
        }
    }

    /**
     * Delete product (soft delete)
     */
    async deleteProduct(req: WarehouseAuthRequest, res: Response) {
        try {
            const { productId } = req.params;
            if (!productId) {
                return res.status(400).json({ success: false, message: "Product ID required" });
            }
            await productService.deleteProduct(productId);

            return res.status(200).json({
                success: true,
                message: "Product deleted successfully",
            });
        } catch (error: any) {
            console.error("Delete product error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to delete product",
            });
        }
    }

    /**
     * Get low stock products
     */
    async getLowStockProducts(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            const products = await productService.getLowStockProducts(warehouseId);

            return res.status(200).json({
                success: true,
                data: products,
            });
        } catch (error: any) {
            console.error("Get low stock products error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch low stock products",
            });
        }
    }

    /**
     * Get product stock summary
     */
    async getProductStockSummary(req: WarehouseAuthRequest, res: Response) {
        try {
            const { productId } = req.params;
            if (!productId) {
                return res.status(400).json({ success: false, message: "Product ID required" });
            }
            const summary = await productService.getProductStockSummary(productId);

            return res.status(200).json({
                success: true,
                data: summary,
            });
        } catch (error: any) {
            console.error("Get product stock summary error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch product stock summary",
            });
        }
    }
}
