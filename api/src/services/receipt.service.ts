import { prisma } from "../lib/prisma";
import type {
    CreateReceiptDto,
    UpdateReceiptDto,
    UpdateReceiptStatusDto,
} from "../types/receipt.types";
import { StockService } from "./stock.service";

const stockService = new StockService();

export class ReceiptService {
    /**
     * Generate unique reference number
     */
    private async generateReferenceNumber(): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const count = await prisma.receipt.count({
            where: {
                referenceNumber: {
                    startsWith: `RCP-${year}${month}${day}`,
                },
            },
        });

        return `RCP-${year}${month}${day}-${String(count + 1).padStart(4, "0")}`;
    }

    /**
     * Create a new receipt (DRAFT status)
     */
    async createReceipt(data: CreateReceiptDto, userId: string) {
        const referenceNumber = await this.generateReferenceNumber();

        return await prisma.$transaction(async (tx) => {
            const receipt = await tx.receipt.create({
                data: {
                    referenceNumber,
                    vendorId: data.vendorId,
                    warehouseId: data.warehouseId,
                    notes: data.notes,
                    createdById: userId,
                    status: "DRAFT",
                    items: {
                        create: data.items.map((item) => ({
                            productId: item.productId,
                            locationId: item.locationId,
                            quantityOrdered: item.quantityOrdered || item.quantity || 0,
                            quantityReceived: 0,
                        })),
                    },
                },
                include: {
                    vendor: true,
                    warehouse: true,
                    items: {
                        include: {
                            product: true,
                            location: true,
                        },
                    },
                },
            });

            return receipt;
        });
    }

    /**
     * Get receipt by ID
     */
    async getReceiptById(id: string) {
        return await prisma.receipt.findUnique({
            where: { id },
            include: {
                vendor: true,
                warehouse: true,
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                updatedBy: {
                    select: { id: true, name: true, email: true },
                },
                items: {
                    include: {
                        product: true,
                        location: true,
                    },
                },
            },
        });
    }

    /**
     * Get all receipts with filters
     */
    async getAllReceipts(filters?: {
        warehouseId?: string;
        vendorId?: string;
        status?: "DRAFT" | "READY" | "DONE";
        startDate?: string;
        endDate?: string;
    }) {
        const where: any = {};

        if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
        if (filters?.vendorId) where.vendorId = filters.vendorId;
        if (filters?.status) where.status = filters.status;
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
            if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
        }

        return await prisma.receipt.findMany({
            where,
            include: {
                vendor: true,
                warehouse: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    /**
     * Update receipt (DRAFT status only)
     */
    async updateReceipt(id: string, data: UpdateReceiptDto, userId: string) {
        const receipt = await prisma.receipt.findUnique({
            where: { id },
        });

        if (!receipt) {
            throw new Error("Receipt not found");
        }

        if (receipt.status !== "DRAFT") {
            throw new Error("Only DRAFT receipts can be updated");
        }

        return await prisma.$transaction(async (tx) => {
            // Update receipt
            const updated = await tx.receipt.update({
                where: { id },
                data: {
                    notes: data.notes,
                    updatedById: userId,
                },
            });

            // Update items if provided
            if (data.items && data.items.length > 0) {
                // Delete old items
                await tx.receiptItem.deleteMany({
                    where: { receiptId: id },
                });

                // Create new items
                await tx.receiptItem.createMany({
                    data: data.items.map((item) => ({
                        receiptId: id,
                        productId: item.productId,
                        locationId: item.locationId,
                        quantityOrdered: item.quantityOrdered || 0,
                        quantityReceived: item.quantityReceived || 0,
                    })),
                });
            }

            return await tx.receipt.findUnique({
                where: { id },
                include: {
                    vendor: true,
                    warehouse: true,
                    items: {
                        include: {
                            product: true,
                            location: true,
                        },
                    },
                },
            });
        });
    }

    /**
     * Update receipt status (DRAFT → READY → DONE)
     */
    async updateReceiptStatus(
        id: string,
        status: "DRAFT" | "READY" | "DONE",
        userId: string
    ) {
        const receipt = await this.getReceiptById(id);

        if (!receipt) {
            throw new Error("Receipt not found");
        }

        // Validate status transitions
        if (status === "READY" && receipt.status !== "DRAFT") {
            throw new Error("Can only move to READY from DRAFT status");
        }

        if (status === "DONE" && receipt.status !== "READY") {
            throw new Error("Can only move to DONE from READY status");
        }

        // Validate items before moving to READY
        if (status === "READY") {
            if (!receipt.items || receipt.items.length === 0) {
                throw new Error("Receipt must have at least one item");
            }

            // Validate all items have locations
            const itemsWithoutLocation = receipt.items.filter((item: any) => !item.locationId);
            if (itemsWithoutLocation.length > 0) {
                throw new Error("All items must have a location assigned");
            }
        }

        // Process stock when moving to DONE
        if (status === "DONE") {
            return await prisma.$transaction(async (tx) => {
                // Apply stock changes for each item
                for (const item of receipt.items) {
                    const quantityToReceive = item.quantityReceived || item.quantityOrdered;

                    await stockService.applyStockChange({
                        productId: item.productId,
                        warehouseId: receipt.warehouseId,
                        locationId: item.locationId,
                        quantityDelta: quantityToReceive,
                        movementType: "RECEIPT",
                        reference: receipt.referenceNumber,
                        notes: `Receipt from vendor: ${receipt.vendor.name}`,
                    }, receipt.createdById);

                    // Update received quantity
                    await tx.receiptItem.update({
                        where: { id: item.id },
                        data: { quantityReceived: quantityToReceive },
                    });
                }

                // Update receipt status
                return await tx.receipt.update({
                    where: { id },
                    data: {
                        status: status,
                        updatedById: userId,
                    },
                    include: {
                        vendor: true,
                        warehouse: true,
                        items: {
                            include: {
                                product: true,
                                location: true,
                            },
                        },
                    },
                });
            });
        }

        // For DRAFT → READY, just update status
        return await prisma.receipt.update({
            where: { id },
            data: {
                status: status,
                updatedById: userId,
            },
            include: {
                vendor: true,
                warehouse: true,
                items: {
                    include: {
                        product: true,
                        location: true,
                    },
                },
            },
        });
    }

    /**
     * Delete receipt (DRAFT only)
     */
    async deleteReceipt(id: string) {
        const receipt = await prisma.receipt.findUnique({
            where: { id },
        });

        if (!receipt) {
            throw new Error("Receipt not found");
        }

        if (receipt.status !== "DRAFT") {
            throw new Error("Only DRAFT receipts can be deleted");
        }

        return await prisma.receipt.delete({
            where: { id },
        });
    }
}
