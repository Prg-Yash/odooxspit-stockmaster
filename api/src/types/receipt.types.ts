import { z } from "zod";

// Receipt DTOs
export const createReceiptSchema = z.object({
    vendorId: z.string().cuid("Invalid vendor ID"),
    warehouseId: z.string().cuid("Invalid warehouse ID"),
    notes: z.string().optional(),
    items: z.array(
        z.object({
            productId: z.string().cuid("Invalid product ID"),
            locationId: z.string().cuid("Invalid location ID"),
            quantity: z.number().int().positive("Quantity must be positive").optional(),
            quantityOrdered: z.number().int().positive("Quantity must be positive").optional(),
            unitPrice: z.number().positive("Unit price must be positive").optional(),
        })
    ).min(1, "At least one item is required"),
});

export const updateReceiptSchema = z.object({
    notes: z.string().optional(),
    items: z.array(
        z.object({
            id: z.string().cuid().optional(),
            productId: z.string().cuid("Invalid product ID"),
            locationId: z.string().cuid("Invalid location ID"),
            quantityOrdered: z.number().int().positive().optional(),
            quantityReceived: z.number().int().min(0).optional(),
        })
    ).optional(),
});

export const updateReceiptStatusSchema = z.object({
    status: z.enum(["DRAFT", "READY", "DONE"]),
});

export type CreateReceiptDto = z.infer<typeof createReceiptSchema>;
export type UpdateReceiptDto = z.infer<typeof updateReceiptSchema>;
export type UpdateReceiptStatusDto = z.infer<typeof updateReceiptStatusSchema>;
