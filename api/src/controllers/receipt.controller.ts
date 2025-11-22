import type { Request, Response } from "express";
import { ReceiptService } from "../services/receipt.service";
import {
    createReceiptSchema,
    updateReceiptSchema,
    updateReceiptStatusSchema,
} from "../types/receipt.types";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";

const receiptService = new ReceiptService();

function handlePrismaError(error: any): string {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                return "A receipt with this reference already exists";
            case "P2003":
                return "Referenced record not found";
            case "P2025":
                return "Receipt not found";
            default:
                return "Database operation failed";
        }
    }
    return error.message || "Internal server error";
}

export const createReceipt = async (req: Request, res: Response) => {
    try {
        const data = createReceiptSchema.parse(req.body);
        const userId = req.user!.id;
        const receipt = await receiptService.createReceipt(data, userId);
        res.status(201).json(receipt);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: "Validation error", details: error.issues });
        }
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const getReceiptById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Receipt ID is required" });
        }
        const receipt = await receiptService.getReceiptById(id);

        if (!receipt) {
            return res.status(404).json({ error: "Receipt not found" });
        }

        res.json(receipt);
    } catch (error) {
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const getAllReceipts = async (req: Request, res: Response) => {
    try {
        const filters = {
            vendorId: req.query.vendorId as string | undefined,
            warehouseId: req.query.warehouseId as string | undefined,
            status: req.query.status as "DRAFT" | "READY" | "DONE" | undefined,
            startDate: req.query.startDate as string | undefined,
            endDate: req.query.endDate as string | undefined,
        };

        const receipts = await receiptService.getAllReceipts(filters);
        res.json(receipts);
    } catch (error) {
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const updateReceipt = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Receipt ID is required" });
        }

        // Get receipt to check warehouse access
        const receipt = await receiptService.getReceiptById(id);
        if (!receipt) {
            return res.status(404).json({ error: "Receipt not found" });
        }

        // Check user has manager role
        if (req.user?.role !== "OWNER" && req.user?.role !== "MANAGER") {
            return res.status(403).json({ error: "Manager role required" });
        }

        const data = updateReceiptSchema.parse(req.body);
        const userId = req.user!.id;
        const updatedReceipt = await receiptService.updateReceipt(id, data, userId);
        res.json(updatedReceipt);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: "Validation error", details: error.issues });
        }
        if (error instanceof Error && error.message.includes("DRAFT")) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const updateReceiptStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Receipt ID is required" });
        }

        // Get receipt to check warehouse access
        const receipt = await receiptService.getReceiptById(id);
        if (!receipt) {
            return res.status(404).json({ error: "Receipt not found" });
        }

        // Check user has manager role
        if (req.user?.role !== "OWNER" && req.user?.role !== "MANAGER") {
            return res.status(403).json({ error: "Manager role required" });
        }

        const data = updateReceiptStatusSchema.parse(req.body);
        const userId = req.user!.id;
        const updatedReceipt = await receiptService.updateReceiptStatus(id, data.status, userId);
        res.json(updatedReceipt);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: "Validation error", details: error.issues });
        }
        if (error instanceof Error && (error.message.includes("cannot") || error.message.includes("Invalid") || error.message.includes("Can only"))) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const deleteReceipt = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Receipt ID is required" });
        }

        // Get receipt to check warehouse access
        const receipt = await receiptService.getReceiptById(id);
        if (!receipt) {
            return res.status(404).json({ error: "Receipt not found" });
        }

        // Check user has manager role
        if (req.user?.role !== "OWNER" && req.user?.role !== "MANAGER") {
            return res.status(403).json({ error: "Manager role required" });
        }

        await receiptService.deleteReceipt(id);
        res.status(200).json({ message: "Receipt deleted successfully" });
    } catch (error: any) {
        if (error.message && error.message.includes("DRAFT")) {
            return res.status(400).json({ error: error.message });
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
            return res.status(400).json({ error: "Cannot delete receipt with related records" });
        }
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const printReceipt = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Receipt ID is required" });
        }
        const receipt = await receiptService.getReceiptById(id);

        if (!receipt) {
            return res.status(404).json({ error: "Receipt not found" });
        }

        // TODO: Implement PDF generation
        res.status(501).json({ error: "PDF generation not implemented yet" });
    } catch (error) {
        res.status(500).json({ error: handlePrismaError(error) });
    }
};
