import { z } from "zod";

// Move History DTOs
export const updateMovementStatusSchema = z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export const moveHistoryFilterSchema = z.object({
    productId: z.string().cuid().optional(),
    vendorId: z.string().cuid().optional(),
    warehouseId: z.string().cuid().optional(),
    type: z.enum(["RECEIPT", "DELIVERY", "ADJUSTMENT", "TRANSFER_IN", "TRANSFER_OUT"]).optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    limit: z.number().int().positive().max(1000).optional(),
    offset: z.number().int().min(0).optional(),
});

export type UpdateMovementStatusDto = z.infer<typeof updateMovementStatusSchema>;
export type MoveHistoryFilterDto = z.infer<typeof moveHistoryFilterSchema>;
