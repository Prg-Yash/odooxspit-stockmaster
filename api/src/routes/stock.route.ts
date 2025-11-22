import { Router } from "express";
import { StockController } from "../controllers/stock.controller";
import { requireAuth } from "../middlewares/require-auth";
import { requireWarehouseAccess } from "../middlewares/require-warehouse-role";

const router = Router();
const stockController = new StockController();

// All stock routes require authentication and warehouse access
router.use(requireAuth);

// Stock Operations (all require warehouse access)
router.post(
  "/warehouse/:warehouseId/receive",
  requireWarehouseAccess,
  stockController.receiveStock.bind(stockController)
);
router.post(
  "/warehouse/:warehouseId/deliver",
  requireWarehouseAccess,
  stockController.deliverStock.bind(stockController)
);
router.post(
  "/adjust",
  requireWarehouseAccess,
  stockController.adjustStock.bind(stockController)
);
router.post(
  "/transfer",
  requireWarehouseAccess,
  stockController.transferStock.bind(stockController)
);

// Stock Queries
router.get(
  "/warehouse/:warehouseId/levels",
  requireWarehouseAccess,
  stockController.getStockLevels.bind(stockController)
);
router.get(
  "/warehouse/:warehouseId/movements",
  requireWarehouseAccess,
  stockController.getStockMovements.bind(stockController)
);
router.get(
  "/warehouse/:warehouseId/alerts",
  requireWarehouseAccess,
  stockController.getLowStockAlerts.bind(stockController)
);
router.get(
  "/warehouse/:warehouseId/summary",
  requireWarehouseAccess,
  stockController.getWarehouseStockSummary.bind(stockController)
);

export { router as stockRouter };
