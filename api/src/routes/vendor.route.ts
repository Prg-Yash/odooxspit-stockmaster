import { Router } from "express";
import * as vendorController from "../controllers/vendor.controller";
import { requireAuth } from "../middlewares/require-auth";
import { requireWarehouseManager } from "../middlewares/require-warehouse-role";

const router = Router();

// All vendor routes require authentication
router.use(requireAuth);

// Create vendor (MANAGER only)
router.post("/", requireWarehouseManager, vendorController.createVendor);

// Get all vendors
router.get("/", vendorController.getAllVendors);

// Get vendor by ID
router.get("/:id", vendorController.getVendorById);

// Get vendor history
router.get("/:id/history", vendorController.getVendorHistory);

// Update vendor (MANAGER only)
router.put("/:id", requireWarehouseManager, vendorController.updateVendor);

// Delete vendor (MANAGER only)
router.delete("/:id", requireWarehouseManager, vendorController.deleteVendor);

export default router;
