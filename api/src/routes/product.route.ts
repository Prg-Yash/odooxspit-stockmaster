import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { requireAuth } from "../middlewares/require-auth";
import {
    requireWarehouseAccess,
    requireWarehouseManager,
} from "../middlewares/require-warehouse-role";

const router = Router();
const productController = new ProductController();

// All product routes require authentication
router.use(requireAuth);

// Product Categories (global, not warehouse-specific)
router.post(
    "/categories",
    productController.createCategory.bind(productController)
);
router.get(
    "/categories",
    productController.getCategories.bind(productController)
);
router.get(
    "/categories/:categoryId",
    productController.getCategory.bind(productController)
);
router.put(
    "/categories/:categoryId",
    productController.updateCategory.bind(productController)
);
router.delete(
    "/categories/:categoryId",
    productController.deleteCategory.bind(productController)
);

// Products (warehouse-specific)
router.get(
    "/warehouse/:warehouseId",
    requireWarehouseAccess,
    productController.getProducts.bind(productController)
);
router.post(
    "/warehouse/:warehouseId",
    requireWarehouseManager,
    productController.createProduct.bind(productController)
);
router.get(
    "/warehouse/:warehouseId/low-stock",
    requireWarehouseAccess,
    productController.getLowStockProducts.bind(productController)
);
router.get(
    "/:productId",
    productController.getProduct.bind(productController)
);
router.get(
    "/:productId/stock-summary",
    productController.getProductStockSummary.bind(productController)
);
router.put(
    "/:productId",
    productController.updateProduct.bind(productController)
);
router.delete(
    "/:productId",
    productController.deleteProduct.bind(productController)
);

export { router as productRouter };
