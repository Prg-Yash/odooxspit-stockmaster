import type { Request, Response } from "express";
import { MoveHistoryService } from "../services/move-history.service";
import {
    updateMovementStatusSchema,
    moveHistoryFilterSchema,
} from "../types/move-history.types";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";

const moveHistoryService = new MoveHistoryService();

function handlePrismaError(error: any): string {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                return "Duplicate movement record";
            case "P2003":
                return "Referenced record not found";
            case "P2025":
                return "Movement not found";
            default:
                return "Database operation failed";
        }
    }
    return error.message || "Internal server error";
}

export const getMovements = async (req: Request, res: Response) => {
    try {
        const filters = moveHistoryFilterSchema.parse({
            productId: req.query.productId,
            warehouseId: req.query.warehouseId,
            type: req.query.type,
            status: req.query.status,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        });

        const result = await moveHistoryService.getMovements(filters);
        res.json(result);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: "Validation error", details: error.issues });
        }
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const getMovementById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Movement ID is required" });
        }
        const movement = await moveHistoryService.getMovementById(id);

        if (!movement) {
            return res.status(404).json({ error: "Movement not found" });
        }

        res.json(movement);
    } catch (error) {
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const updateMovementStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Movement ID is required" });
        }
        // Check if user is OWNER or MANAGER
        if (req.user?.role !== "OWNER" && req.user?.role !== "MANAGER") {
            return res.status(403).json({ error: "Only OWNER and MANAGER can update movement status" });
        }
        const data = updateMovementStatusSchema.parse(req.body);
        const movement = await moveHistoryService.updateMovementStatus(id, data);
        res.json(movement);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: "Validation error", details: error.issues });
        }
        if (error instanceof Error && error.message.includes("not found")) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const getMovementSummary = async (req: Request, res: Response) => {
    try {
        const { warehouseId } = req.params;
        if (!warehouseId) {
            return res.status(400).json({ error: "Warehouse ID is required" });
        }
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;

        const summary = await moveHistoryService.getMovementSummary(warehouseId, startDate, endDate);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const getVendorMovements = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.params;
        if (!vendorId) {
            return res.status(400).json({ error: "Vendor ID is required" });
        }
        const history = await moveHistoryService.getVendorMovements(vendorId);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: handlePrismaError(error) });
    }
};
