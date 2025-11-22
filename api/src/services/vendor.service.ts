import { prisma } from "../lib/prisma";
import type { CreateVendorDto, UpdateVendorDto } from "../types/vendor.types";

export class VendorService {
    /**
     * Create a new vendor
     */
    async createVendor(data: CreateVendorDto) {
        return await prisma.vendor.create({
            data,
        });
    }

    /**
     * Get vendor by ID
     */
    async getVendorById(id: string) {
        return await prisma.vendor.findUnique({
            where: { id },
            include: {
                receipts: {
                    select: {
                        id: true,
                        referenceNumber: true,
                        status: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
                deliveries: {
                    select: {
                        id: true,
                        referenceNumber: true,
                        status: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
            },
        });
    }

    /**
     * Get all vendors
     */
    async getAllVendors(includeInactive = false) {
        return await prisma.vendor.findMany({
            where: includeInactive ? {} : { isActive: true },
            orderBy: { name: "asc" },
        });
    }

    /**
     * Update vendor
     */
    async updateVendor(id: string, data: UpdateVendorDto) {
        return await prisma.vendor.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete vendor (only if no draft receipts exist)
     */
    async deleteVendor(id: string) {
        // Check for draft receipts
        const draftReceipts = await prisma.receipt.count({
            where: {
                vendorId: id,
                status: "DRAFT",
            },
        });

        if (draftReceipts > 0) {
            throw new Error(
                "Cannot delete vendor with draft receipts. Please complete or delete draft receipts first."
            );
        }

        return await prisma.vendor.delete({
            where: { id },
        });
    }

    /**
     * Get vendor history (incoming & outgoing stock movements)
     */
    async getVendorHistory(vendorId: string) {
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
        });

        if (!vendor) {
            throw new Error("Vendor not found");
        }

        // Get receipts (incoming)
        const receipts = await prisma.receipt.findMany({
            where: { vendorId },
            include: {
                warehouse: {
                    select: { id: true, name: true, code: true },
                },
                items: {
                    include: {
                        product: {
                            select: { id: true, sku: true, name: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Get deliveries (outgoing)
        const deliveries = await prisma.delivery.findMany({
            where: { vendorId },
            include: {
                warehouse: {
                    select: { id: true, name: true, code: true },
                },
                items: {
                    include: {
                        product: {
                            select: { id: true, sku: true, name: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Calculate summaries
        const totalReceived = receipts
            .filter((r: any) => r.status === "DONE")
            .reduce(
                (sum: number, r: any) =>
                    sum +
                    r.items.reduce((itemSum: number, item: any) => itemSum + item.quantityReceived, 0),
                0
            );

        const totalDelivered = deliveries
            .filter((d: any) => d.status === "DONE")
            .reduce(
                (sum: number, d: any) =>
                    sum +
                    d.items.reduce((itemSum: number, item: any) => itemSum + item.quantityDelivered, 0),
                0
            );

        return {
            vendor,
            receipts,
            deliveries,
            summary: {
                totalReceived,
                totalDelivered,
                totalReceipts: receipts.length,
                totalDeliveries: deliveries.length,
            },
        };
    }
}
