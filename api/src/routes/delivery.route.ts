import { Router } from "express";
import * as deliveryController from "../controllers/delivery.controller";
import { requireAuth } from "../middlewares/require-auth";
import { requireWarehouseManager } from "../middlewares/require-warehouse-role";

const router = Router();

// All delivery routes require authentication
router.use(requireAuth);

// Create delivery (MANAGER only)
router.post("/", requireWarehouseManager, deliveryController.createDelivery);

// Get all deliveries
router.get("/", deliveryController.getAllDeliveries);

// Get delivery by ID
router.get("/:id", deliveryController.getDeliveryById);

// Print delivery PDF
router.get("/:id/print", deliveryController.printDelivery);

// Update delivery (MANAGER only)
router.put("/:id", requireWarehouseManager, deliveryController.updateDelivery);

// Update delivery status (MANAGER only)
router.patch("/:id/status", requireWarehouseManager, deliveryController.updateDeliveryStatus);

// Delete delivery (MANAGER only)
router.delete("/:id", requireWarehouseManager, deliveryController.deleteDelivery);

export default router;
