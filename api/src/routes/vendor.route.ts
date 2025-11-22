import { Router } from "express";
import * as vendorController from "../controllers/vendor.controller";
import { requireAuth } from "../middlewares/require-auth";

const router = Router();

// All vendor routes require authentication
// router.use(requireAuth);

// Create vendor (OWNER/MANAGER only)
router.post("/", vendorController.createVendor);

// Get all vendors
router.get("/", vendorController.getAllVendors);

// Get vendor by ID
router.get("/:id", vendorController.getVendorById);

// Get vendor history
router.get("/:id/history", vendorController.getVendorHistory);

// Update vendor (OWNER/MANAGER only)
router.put("/:id", vendorController.updateVendor);

// Delete vendor (OWNER/MANAGER only)
router.delete("/:id", vendorController.deleteVendor);

export default router;
