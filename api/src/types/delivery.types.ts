import { z } from "zod";

// Delivery DTOs
export const createDeliverySchema = z.object({
    vendorId: z.string().cuid("Invalid vendor ID").optional(),
    userId: z.string().cuid("Invalid user ID").optional(),
    warehouseId: z.string().cuid("Invalid warehouse ID"),
    notes: z.string().optional(),
    items: z.array(
        z.object({
            productId: z.string().cuid("Invalid product ID"),
            locationId: z.string().cuid("Invalid location ID"),
            quantityOrdered: z.number().int().positive("Quantity must be positive"),
        })
    ).min(1, "At least one item is required"),
}).refine((data) => data.vendorId || data.userId, {
    message: "Either vendorId or userId must be provided",
});

export const updateDeliverySchema = z.object({
    notes: z.string().optional(),
    items: z.array(
        z.object({
            id: z.string().cuid().optional(),
            productId: z.string().cuid("Invalid product ID"),
            locationId: z.string().cuid("Invalid location ID"),
            quantityOrdered: z.number().int().positive().optional(),
            quantityDelivered: z.number().int().min(0).optional(),
        })
    ).optional(),
});

export const updateDeliveryStatusSchema = z.object({
    status: z.enum(["DRAFT", "READY", "DONE"]),
});

export type CreateDeliveryDto = z.infer<typeof createDeliverySchema>;
export type UpdateDeliveryDto = z.infer<typeof updateDeliverySchema>;
export type UpdateDeliveryStatusDto = z.infer<typeof updateDeliveryStatusSchema>;
