import { z } from "zod";
import { WarehouseMemberRole } from "../generated/prisma/enums";

// Warehouse DTOs
export const createWarehouseSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    capacity: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
});

export const updateWarehouseSchema = z.object({
    name: z.string().min(1).optional(),
    capacity: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    isActive: z.boolean().optional(),
});

export const addWarehouseMemberSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    role: z.nativeEnum(WarehouseMemberRole),
});

export const updateWarehouseMemberSchema = z.object({
    role: z.nativeEnum(WarehouseMemberRole),
});

// Location DTOs
export const createLocationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required").optional(),
    aisle: z.string().optional(),
    rack: z.string().optional(),
    shelf: z.string().optional(),
    bin: z.string().optional(),
});

export const updateLocationSchema = z.object({
    name: z.string().min(1).optional(),
    aisle: z.string().optional(),
    rack: z.string().optional(),
    shelf: z.string().optional(),
    bin: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type CreateWarehouseDto = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseDto = z.infer<typeof updateWarehouseSchema>;
export type AddWarehouseMemberDto = z.infer<typeof addWarehouseMemberSchema>;
export type UpdateWarehouseMemberDto = z.infer<typeof updateWarehouseMemberSchema>;
export type CreateLocationDto = z.infer<typeof createLocationSchema>;
export type UpdateLocationDto = z.infer<typeof updateLocationSchema>;
