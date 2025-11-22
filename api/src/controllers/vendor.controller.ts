import type { Request, Response } from "express";
import { VendorService } from "../services/vendor.service";
import { createVendorSchema, updateVendorSchema } from "../types/vendor.types";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";

const vendorService = new VendorService();

function handlePrismaError(error: any): string {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                return "A vendor with this information already exists";
            case "P2003":
                return "Referenced record not found";
            case "P2025":
                return "Vendor not found";
            default:
                return "Database operation failed";
        }
    }
    return error.message || "Internal server error";
}

export const createVendor = async (req: Request, res: Response) => {
    try {
        const data = createVendorSchema.parse(req.body);
        const vendor = await vendorService.createVendor(data);
        res.status(201).json(vendor);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: "Validation error", details: error.issues });
        }
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const getVendorById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Vendor ID is required" });
        }
        const vendor = await vendorService.getVendorById(id);

        if (!vendor) {
            return res.status(404).json({ error: "Vendor not found" });
        }

        res.json(vendor);
    } catch (error) {
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const getAllVendors = async (req: Request, res: Response) => {
    try {
        const isActive = req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
        const vendors = await vendorService.getAllVendors(isActive);
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const updateVendor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Vendor ID is required" });
        }
        const data = updateVendorSchema.parse(req.body);
        const vendor = await vendorService.updateVendor(id, data);
        res.json(vendor);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ error: "Validation error", details: error.issues });
        }
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const deleteVendor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Vendor ID is required" });
        }
        await vendorService.deleteVendor(id);
        res.status(204).send();
    } catch (error: any) {
        if (error.message.includes("draft receipts")) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: handlePrismaError(error) });
    }
};

export const getVendorHistory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Vendor ID is required" });
        }
        const history = await vendorService.getVendorHistory(id);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: handlePrismaError(error) });
    }
};
