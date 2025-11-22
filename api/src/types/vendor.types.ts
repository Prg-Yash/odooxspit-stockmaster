import { z } from "zod";

// Vendor DTOs
export const createVendorSchema = z.object({
    name: z.string().min(1, "Vendor name is required"),
    companyName: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
});

export const updateVendorSchema = z.object({
    name: z.string().min(1).optional(),
    companyName: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type CreateVendorDto = z.infer<typeof createVendorSchema>;
export type UpdateVendorDto = z.infer<typeof updateVendorSchema>;
