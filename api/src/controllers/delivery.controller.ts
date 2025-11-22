import type { Request, Response } from "express";
import { DeliveryService } from "../services/delivery.service";
import {
    createDeliverySchema,
    updateDeliverySchema,
    updateDeliveryStatusSchema,
} from "../types/delivery.types";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";

const deliveryService = new DeliveryService();

function handlePrismaError(error: any): string {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                return "A delivery with this reference already exists";
            case "P2003":
                return "Referenced record not found";
            case "P2025":
                return "Delivery not found";
            default:
                return "Database operation failed";
        }
    }
    return error.message || "Internal server error";
}

export const createDelivery = async (req: Request, res: Response) => {
    try {
        const data = createDeliverySchema.parse(req.body);
        const userId = req.user!.id;
        const delivery = await deliveryService.createDelivery(data, userId);
        res.status(201).json(delivery);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: "Validation error", details: error.issues });
        }
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const getDeliveryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Delivery ID is required" });
        }
        const delivery = await deliveryService.getDeliveryById(id);

        if (!delivery) {
            return res.status(404).json({ error: "Delivery not found" });
        }

        res.json(delivery);
    } catch (error) {
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const getAllDeliveries = async (req: Request, res: Response) => {
    try {
        const filters = {
            vendorId: req.query.vendorId as string | undefined,
            userId: req.query.userId as string | undefined,
            warehouseId: req.query.warehouseId as string | undefined,
            status: req.query.status as "DRAFT" | "READY" | "DONE" | undefined,
            startDate: req.query.startDate as string | undefined,
            endDate: req.query.endDate as string | undefined,
        };

        const deliveries = await deliveryService.getAllDeliveries(filters);
        res.json(deliveries);
    } catch (error) {
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const updateDelivery = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Delivery ID is required" });
        }
        const data = updateDeliverySchema.parse(req.body);
        const userId = req.user!.id;
        const delivery = await deliveryService.updateDelivery(id, data, userId);
        res.json(delivery);
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

export const updateDeliveryStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Delivery ID is required" });
        }
        const data = updateDeliveryStatusSchema.parse(req.body);
        const userId = req.user!.id;
        const delivery = await deliveryService.updateDeliveryStatus(id, data.status, userId);
        res.json(delivery);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: "Validation error", details: error.issues });
        }
        if (error instanceof Error && (error.message.includes("cannot") || error.message.includes("Invalid") || error.message.includes("Insufficient"))) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const deleteDelivery = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Delivery ID is required" });
        }
        await deliveryService.deleteDelivery(id);
        res.status(204).send();
    } catch (error: any) {
        if (error.message.includes("DRAFT")) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const printDelivery = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Delivery ID is required" });
        }
        const delivery = await deliveryService.getDeliveryById(id);

        if (!delivery) {
            return res.status(404).json({ error: "Delivery not found" });
        }

        // TODO: Implement PDF generation
        res.status(501).json({ error: "PDF generation not implemented yet" });
    } catch (error) {
        res.status(500).json({ error: handlePrismaError(error) });
    }
};
