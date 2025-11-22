import { prisma } from "../lib/prisma";
import type {
    CreateDeliveryDto,
    UpdateDeliveryDto,
    UpdateDeliveryStatusDto,
} from "../types/delivery.types";
import { StockService } from "./stock.service";

const stockService = new StockService();

export class DeliveryService {
    /**
     * Generate unique reference number
     */
    private async generateReferenceNumber(): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const count = await prisma.delivery.count({
            where: {
                referenceNumber: {
                    startsWith: `DLV-${year}${month}${day}`,
                },
            },
        });

        return `DLV-${year}${month}${day}-${String(count + 1).padStart(4, "0")}`;
    }

    /**
     * Create a new delivery (DRAFT status)
     */
    async createDelivery(data: CreateDeliveryDto, userId: string) {
        const referenceNumber = await this.generateReferenceNumber();

        return await prisma.$transaction(async (tx) => {
            const delivery = await tx.delivery.create({
                data: {
                    referenceNumber,
                    vendorId: data.vendorId,
                    userId: data.userId,
                    warehouseId: data.warehouseId,
                    notes: data.notes,
                    createdById: userId,
                    status: "DRAFT",
                    items: {
                        create: data.items.map((item) => ({
                            productId: item.productId,
                            locationId: item.locationId,
                            quantityOrdered: item.quantityOrdered,
                            quantityDelivered: 0,
                        })),
                    },
                },
                include: {
                    vendor: true,
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                    warehouse: true,
                    items: {
                        include: {
                            product: true,
                            location: true,
                        },
                    },
                },
            });

            return delivery;
        });
    }

    /**
     * Get delivery by ID
     */
    async getDeliveryById(id: string) {
        return await prisma.delivery.findUnique({
            where: { id },
            include: {
                vendor: true,
                user: {
                    select: { id: true, name: true, email: true },
                },
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
     * Get all deliveries with filters
     */
    async getAllDeliveries(filters?: {
        warehouseId?: string;
        vendorId?: string;
        userId?: string;
        status?: "DRAFT" | "READY" | "DONE";
        startDate?: string;
        endDate?: string;
    }) {
        const where: any = {};

        if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
        if (filters?.vendorId) where.vendorId = filters.vendorId;
        if (filters?.userId) where.userId = filters.userId;
        if (filters?.status) where.status = filters.status;
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
            if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
        }

        return await prisma.delivery.findMany({
            where,
            include: {
                vendor: true,
                user: {
                    select: { id: true, name: true, email: true },
                },
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
     * Update delivery (DRAFT status only)
     */
    async updateDelivery(id: string, data: UpdateDeliveryDto, userId: string) {
        const delivery = await prisma.delivery.findUnique({
            where: { id },
        });

        if (!delivery) {
            throw new Error("Delivery not found");
        }

        if (delivery.status !== "DRAFT") {
            throw new Error("Only DRAFT deliveries can be updated");
        }

        return await prisma.$transaction(async (tx) => {
            // Update delivery
            const updated = await tx.delivery.update({
                where: { id },
                data: {
                    notes: data.notes,
                    updatedById: userId,
                },
            });

            // Update items if provided
            if (data.items && data.items.length > 0) {
                // Delete old items
                await tx.deliveryItem.deleteMany({
                    where: { deliveryId: id },
                });

                // Create new items
                await tx.deliveryItem.createMany({
                    data: data.items.map((item) => ({
                        deliveryId: id,
                        productId: item.productId,
                        locationId: item.locationId,
                        quantityOrdered: item.quantityOrdered || 0,
                        quantityDelivered: item.quantityDelivered || 0,
                    })),
                });
            }

            return await tx.delivery.findUnique({
                where: { id },
                include: {
                    vendor: true,
                    user: {
                        select: { id: true, name: true, email: true },
                    },
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
     * Update delivery status (DRAFT → READY → DONE)
     */
    async updateDeliveryStatus(
        id: string,
        status: "DRAFT" | "READY" | "DONE",
        userId: string
    ) {
        const delivery = await this.getDeliveryById(id);

        if (!delivery) {
            throw new Error("Delivery not found");
        }

        // Validate status transitions
        if (status === "READY" && delivery.status !== "DRAFT") {
            throw new Error("Can only move to READY from DRAFT status");
        }

        if (status === "DONE" && delivery.status !== "READY") {
            throw new Error("Can only move to DONE from READY status");
        }

        // Validate items before moving to READY
        if (status === "READY") {
            if (!delivery.items || delivery.items.length === 0) {
                throw new Error("Delivery must have at least one item");
            }

            // Validate all items have locations
            const itemsWithoutLocation = delivery.items.filter((item: any) => !item.locationId);
            if (itemsWithoutLocation.length > 0) {
                throw new Error("All items must have a location assigned");
            }

            // Validate stock availability
            for (const item of delivery.items) {
                const stockLevel = await prisma.stockLevel.findUnique({
                    where: {
                        productId_warehouseId_locationId: {
                            productId: item.productId,
                            warehouseId: delivery.warehouseId,
                            locationId: item.locationId,
                        },
                    },
                });

                const quantityToDeliver = item.quantityDelivered || item.quantityOrdered;
                if (!stockLevel || stockLevel.quantity < quantityToDeliver) {
                    throw new Error(
                        `Insufficient stock for product ${item.product.name} at location ${item.location.name}`
                    );
                }
            }
        }

        // Process stock when moving to DONE
        if (status === "DONE") {
            return await prisma.$transaction(async (tx) => {
                // Apply stock changes for each item
                for (const item of delivery.items) {
                    const quantityToDeliver = item.quantityDelivered || item.quantityOrdered;

                    await stockService.applyStockChange({
                        productId: item.productId,
                        warehouseId: delivery.warehouseId,
                        locationId: item.locationId,
                        quantityDelta: -quantityToDeliver, // Negative for delivery
                        movementType: "DELIVERY",
                        reference: delivery.referenceNumber,
                        notes: delivery.vendorId
                            ? `Delivery to vendor: ${delivery.vendor?.name}`
                            : `Delivery to user: ${delivery.user?.name}`,
                    }, delivery.createdById);

                    // Update delivered quantity
                    await tx.deliveryItem.update({
                        where: { id: item.id },
                        data: { quantityDelivered: quantityToDeliver },
                    });
                }

                // Update delivery status
                return await tx.delivery.update({
                    where: { id },
                    data: {
                        status: status,
                        updatedById: userId,
                    },
                    include: {
                        vendor: true,
                        user: {
                            select: { id: true, name: true, email: true },
                        },
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
        return await prisma.delivery.update({
            where: { id },
            data: {
                status: status,
                updatedById: userId,
            },
            include: {
                vendor: true,
                user: {
                    select: { id: true, name: true, email: true },
                },
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
     * Delete delivery (DRAFT only)
     */
    async deleteDelivery(id: string) {
        const delivery = await prisma.delivery.findUnique({
            where: { id },
        });

        if (!delivery) {
            throw new Error("Delivery not found");
        }

        if (delivery.status !== "DRAFT") {
            throw new Error("Only DRAFT deliveries can be deleted");
        }

        return await prisma.delivery.delete({
            where: { id },
        });
    }
}
