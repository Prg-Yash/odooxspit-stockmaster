import { Router } from "express";
import * as receiptController from "../controllers/receipt.controller";
import { requireAuth } from "../middlewares/require-auth";
import { requireWarehouseManager } from "../middlewares/require-warehouse-role";

const router = Router();

// All receipt routes require authentication
router.use(requireAuth);

// Create receipt (MANAGER only)
router.post("/", requireWarehouseManager, receiptController.createReceipt);

// Get all receipts
router.get("/", receiptController.getAllReceipts);

// Get receipt by ID
router.get("/:id", receiptController.getReceiptById);

// Print receipt PDF
router.get("/:id/print", receiptController.printReceipt);

// Update receipt (MANAGER only, role check in controller)
router.put("/:id", receiptController.updateReceipt);

// Update receipt status (MANAGER only, role check in controller)
router.patch("/:id/status", receiptController.updateReceiptStatus);

// Delete receipt (MANAGER only, role check in controller)
router.delete("/:id", receiptController.deleteReceipt);

export default router;
