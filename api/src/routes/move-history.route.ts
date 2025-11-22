import { Router } from "express";
import * as moveHistoryController from "../controllers/move-history.controller";
import { requireAuth } from "../middlewares/require-auth";
import { requireWarehouseManager } from "../middlewares/require-warehouse-role";

const router = Router();

// All move history routes require authentication
router.use(requireAuth);

// Get all movements with filters
router.get("/", moveHistoryController.getMovements);

// Get movement summary by warehouse
router.get("/summary/:warehouseId", moveHistoryController.getMovementSummary);

// Get vendor movements
router.get("/vendor/:vendorId", moveHistoryController.getVendorMovements);

// Get movement by ID
router.get("/:id", moveHistoryController.getMovementById);

// Update movement status (MANAGER only)
router.patch("/:id/status", moveHistoryController.updateMovementStatus);

export default router;
