import type { Request, Response } from "express";
import { StockService } from "../services/stock.service";
import {
    createStockMovementSchema,
    transferStockSchema,
    adjustStockSchema,
} from "../types/stock.types";
import type { WarehouseAuthRequest } from "../middlewares/require-warehouse-role";
import { StockMovementType } from "../generated/prisma/enums";

const stockService = new StockService();

export class StockController {
    /**
     * Receive stock (add inventory)
     */
    async receiveStock(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            const userId = req.user.id;
            const validatedData = createStockMovementSchema.parse({
                ...req.body,
                type: StockMovementType.RECEIPT,
            });

            if (validatedData.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity must be positive for receipts",
                });
            }

            const result = await stockService.receiveStock(
                validatedData.productId,
                warehouseId,
                validatedData.locationId,
                validatedData.quantity,
                userId,
                validatedData.reference,
                validatedData.notes
            );

            return res.status(200).json({
                success: true,
                message: "Stock received successfully",
                data: result,
            });
        } catch (error: any) {
            console.error("Receive stock error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to receive stock",
            });
        }
    }

    /**
     * Deliver stock (remove inventory)
     */
    async deliverStock(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            const userId = req.user.id;
            const validatedData = createStockMovementSchema.parse({
                ...req.body,
                type: StockMovementType.DELIVERY,
            });

            if (validatedData.quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity must be positive for deliveries",
                });
            }

            const result = await stockService.deliverStock(
                validatedData.productId,
                warehouseId,
                validatedData.locationId,
                validatedData.quantity,
                userId,
                validatedData.reference,
                validatedData.notes
            );

            return res.status(200).json({
                success: true,
                message: "Stock delivered successfully",
                data: result,
            });
        } catch (error: any) {
            console.error("Deliver stock error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to deliver stock",
            });
        }
    }

    /**
     * Adjust stock to specific quantity
     */
    async adjustStock(req: WarehouseAuthRequest, res: Response) {
        try {
            const userId = req.user.id;
            const validatedData = adjustStockSchema.parse(req.body);

            const result = await stockService.adjustStock(validatedData, userId);

            return res.status(200).json({
                success: true,
                message: "Stock adjusted successfully",
                data: result,
            });
        } catch (error: any) {
            console.error("Adjust stock error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to adjust stock",
            });
        }
    }

    /**
     * Transfer stock between locations
     */
    async transferStock(req: WarehouseAuthRequest, res: Response) {
        try {
            const userId = req.user.id;
            const validatedData = transferStockSchema.parse(req.body);

            const result = await stockService.transferStock(validatedData, userId);

            return res.status(200).json({
                success: true,
                message: "Stock transferred successfully",
                data: {
                    transferOut: result.transferOut.movement,
                    transferIn: result.transferIn.movement,
                    fromLocation: result.fromLocation,
                    toLocation: result.toLocation,
                },
            });
        } catch (error: any) {
            console.error("Transfer stock error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to transfer stock",
            });
        }
    }

    /**
     * Get stock movements (history)
     */
    async getStockMovements(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            const {
                productId,
                locationId,
                userId,
                type,
                startDate,
                endDate,
                limit,
                offset,
            } = req.query;

            const result = await stockService.getStockMovements({
                warehouseId,
                productId: productId as string,
                locationId: locationId as string,
                userId: userId as string,
                type: type as StockMovementType,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                offset: offset ? parseInt(offset as string) : undefined,
            });

            return res.status(200).json({
                success: true,
                data: result.movements,
                pagination: {
                    total: result.total,
                    limit: result.limit,
                    offset: result.offset,
                },
            });
        } catch (error: any) {
            console.error("Get stock movements error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch stock movements",
            });
        }
    }

    /**
     * Get current stock levels
     */
    async getStockLevels(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            const { productId, locationId, includeZero } = req.query;

            const stockLevels = await stockService.getStockLevels(warehouseId, {
                productId: productId as string,
                locationId: locationId as string,
                includeZero: includeZero === "true",
            });

            return res.status(200).json({
                success: true,
                data: stockLevels,
            });
        } catch (error: any) {
            console.error("Get stock levels error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch stock levels",
            });
        }
    }

    /**
     * Get low stock alerts
     */
    async getLowStockAlerts(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            const alerts = await stockService.getLowStockAlerts(warehouseId);

            return res.status(200).json({
                success: true,
                data: alerts,
            });
        } catch (error: any) {
            console.error("Get low stock alerts error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch low stock alerts",
            });
        }
    }

    /**
     * Get warehouse stock summary
     */
    async getWarehouseStockSummary(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            const summary = await stockService.getWarehouseStockSummary(warehouseId);

            return res.status(200).json({
                success: true,
                data: summary,
            });
        } catch (error: any) {
            console.error("Get warehouse stock summary error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch warehouse stock summary",
            });
        }
    }
}
