import { z } from "zod";
import { StockMovementType } from "../generated/prisma/enums";

// Stock Movement DTOs
export const createStockMovementSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    locationId: z.string().min(1, "Location ID is required"),
    type: z.nativeEnum(StockMovementType),
    quantity: z.number().int(),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

export const applyStockChangeSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    warehouseId: z.string().min(1, "Warehouse ID is required"),
    locationId: z.string().min(1, "Location ID is required"),
    quantityDelta: z.number().int(),
    movementType: z.nativeEnum(StockMovementType),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

export const transferStockSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    fromLocationId: z.string().min(1, "From Location ID is required"),
    toLocationId: z.string().min(1, "To Location ID is required"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

export const adjustStockSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    locationId: z.string().min(1, "Location ID is required"),
    newQuantity: z.number().int().min(0, "Quantity cannot be negative"),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

export type CreateStockMovementDto = z.infer<typeof createStockMovementSchema>;
export type ApplyStockChangeDto = z.infer<typeof applyStockChangeSchema>;
export type TransferStockDto = z.infer<typeof transferStockSchema>;
export type AdjustStockDto = z.infer<typeof adjustStockSchema>;
