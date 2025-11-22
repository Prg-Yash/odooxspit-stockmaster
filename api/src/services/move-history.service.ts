import { prisma } from "../lib/prisma";
import type {
    UpdateMovementStatusDto,
    MoveHistoryFilterDto,
} from "../types/move-history.types";

export class MoveHistoryService {
    /**
     * Get all stock movements with filters
     */
    async getMovements(filters: MoveHistoryFilterDto) {
        const where: any = {};

        if (filters.productId) where.productId = filters.productId;
        if (filters.warehouseId) where.warehouseId = filters.warehouseId;
        if (filters.type) where.type = filters.type;
        if (filters.status) where.status = filters.status;

        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
            if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
        }

        const movements = await prisma.stockMovement.findMany({
            where,
            include: {
                product: {
                    select: {
                        id: true,
                        sku: true,
                        name: true,
                    },
                },
                warehouse: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                location: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: filters.limit || 100,
            skip: filters.offset || 0,
        });

        const total = await prisma.stockMovement.count({ where });

        return {
            movements,
            pagination: {
                total,
                limit: filters.limit || 100,
                offset: filters.offset || 0,
            },
        };
    }

    /**
     * Get movement by ID
     */
    async getMovementById(id: string) {
        return await prisma.stockMovement.findUnique({
            where: { id },
            include: {
                product: true,
                warehouse: true,
                location: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    /**
     * Update movement status (Kanban workflow)
     */
    async updateMovementStatus(id: string, data: UpdateMovementStatusDto) {
        const movement = await prisma.stockMovement.findUnique({
            where: { id },
        });

        if (!movement) {
            throw new Error("Movement not found");
        }

        return await prisma.stockMovement.update({
            where: { id },
            data: {
                status: data.status,
            },
            include: {
                product: true,
                warehouse: true,
                location: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    /**
     * Get movement summary by warehouse
     */
    async getMovementSummary(warehouseId: string, startDate?: string, endDate?: string) {
        const where: any = { warehouseId };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const movements = await prisma.stockMovement.findMany({
            where,
            select: {
                type: true,
                quantity: true,
                status: true,
            },
        });

        const summary = {
            totalMovements: movements.length,
            byType: {
                RECEIPT: movements.filter((m) => m.type === "RECEIPT").length,
                DELIVERY: movements.filter((m) => m.type === "DELIVERY").length,
                ADJUSTMENT: movements.filter((m) => m.type === "ADJUSTMENT").length,
                TRANSFER_IN: movements.filter((m) => m.type === "TRANSFER_IN").length,
                TRANSFER_OUT: movements.filter((m) => m.type === "TRANSFER_OUT").length,
            },
            byStatus: {
                PENDING: movements.filter((m) => m.status === "PENDING").length,
                APPROVED: movements.filter((m) => m.status === "APPROVED").length,
                REJECTED: movements.filter((m) => m.status === "REJECTED").length,
            },
            totalQuantityIn: movements
                .filter((m) => ["RECEIPT", "TRANSFER_IN", "ADJUSTMENT"].includes(m.type) && m.quantity > 0)
                .reduce((sum, m) => sum + m.quantity, 0),
            totalQuantityOut: movements
                .filter((m) => ["DELIVERY", "TRANSFER_OUT"].includes(m.type) || m.quantity < 0)
                .reduce((sum, m) => sum + Math.abs(m.quantity), 0),
        };

        return summary;
    }

    /**
     * Get vendor movement history
     */
    async getVendorMovements(vendorId: string) {
        // Get receipts and deliveries for vendor
        const receipts = await prisma.receipt.findMany({
            where: {
                vendorId,
                status: "DONE",
            },
            select: {
                id: true,
                referenceNumber: true,
                createdAt: true,
                warehouse: {
                    select: { name: true },
                },
            },
        });

        const deliveries = await prisma.delivery.findMany({
            where: {
                vendorId,
                status: "DONE",
            },
            select: {
                id: true,
                referenceNumber: true,
                createdAt: true,
                warehouse: {
                    select: { name: true },
                },
            },
        });

        // Get stock movements associated with these references
        const receiptReferences = receipts.map((r) => r.referenceNumber);
        const deliveryReferences = deliveries.map((d) => d.referenceNumber);

        const movements = await prisma.stockMovement.findMany({
            where: {
                OR: [
                    { reference: { in: receiptReferences } },
                    { reference: { in: deliveryReferences } },
                ],
            },
            include: {
                product: {
                    select: { sku: true, name: true },
                },
                warehouse: {
                    select: { name: true, code: true },
                },
                location: {
                    select: { name: true, code: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return {
            receipts,
            deliveries,
            movements,
        };
    }
}
