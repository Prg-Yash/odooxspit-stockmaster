import { prisma } from "../lib/prisma";
import type {
    ApplyStockChangeDto,
    TransferStockDto,
    AdjustStockDto,
} from "../types/stock.types";
import { StockMovementType } from "../generated/prisma/enums";

export class StockService {
    /**
     * Apply stock change with transaction safety
     * Core method for all stock updates
     */
    async applyStockChange(data: ApplyStockChangeDto, userId: string) {
        return await prisma.$transaction(async (tx) => {
            // Validate product exists and is active
            const product = await tx.product.findUnique({
                where: { id: data.productId },
            });

            if (!product || !product.isActive) {
                throw new Error("Product not found or inactive");
            }

            // Validate warehouse
            if (product.warehouseId !== data.warehouseId) {
                throw new Error("Product does not belong to this warehouse");
            }

            // Validate location
            const location = await tx.location.findUnique({
                where: { id: data.locationId },
            });

            if (!location || !location.isActive) {
                throw new Error("Location not found or inactive");
            }

            if (location.warehouseId !== data.warehouseId) {
                throw new Error("Location does not belong to this warehouse");
            }

            // Get or create stock level
            let stockLevel = await tx.stockLevel.findUnique({
                where: {
                    productId_warehouseId_locationId: {
                        productId: data.productId,
                        warehouseId: data.warehouseId,
                        locationId: data.locationId,
                    },
                },
            });

            const newQuantity = (stockLevel?.quantity || 0) + data.quantityDelta;

            // Prevent negative stock
            if (newQuantity < 0) {
                throw new Error(
                    `Insufficient stock. Current: ${stockLevel?.quantity || 0}, Requested: ${Math.abs(data.quantityDelta)}`
                );
            }

            // Update or create stock level
            if (stockLevel) {
                stockLevel = await tx.stockLevel.update({
                    where: { id: stockLevel.id },
                    data: { quantity: newQuantity },
                });
            } else {
                stockLevel = await tx.stockLevel.create({
                    data: {
                        productId: data.productId,
                        warehouseId: data.warehouseId,
                        locationId: data.locationId,
                        quantity: newQuantity,
                    },
                });
            }

            // Create movement record
            const movement = await tx.stockMovement.create({
                data: {
                    productId: data.productId,
                    warehouseId: data.warehouseId,
                    locationId: data.locationId,
                    userId,
                    type: data.movementType,
                    quantity: data.quantityDelta,
                    reference: data.reference,
                    notes: data.notes,
                },
                include: {
                    product: true,
                    location: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            });

            return {
                stockLevel,
                movement,
            };
        });
    }

    /**
     * Receive stock (RECEIPT)
     */
    async receiveStock(
        productId: string,
        warehouseId: string,
        locationId: string,
        quantity: number,
        userId: string,
        reference?: string,
        notes?: string
    ) {
        if (quantity <= 0) {
            throw new Error("Quantity must be positive for receipts");
        }

        return await this.applyStockChange(
            {
                productId,
                warehouseId,
                locationId,
                quantityDelta: quantity,
                movementType: StockMovementType.RECEIPT,
                reference,
                notes,
            },
            userId
        );
    }

    /**
     * Deliver stock (DELIVERY)
     */
    async deliverStock(
        productId: string,
        warehouseId: string,
        locationId: string,
        quantity: number,
        userId: string,
        reference?: string,
        notes?: string
    ) {
        if (quantity <= 0) {
            throw new Error("Quantity must be positive for deliveries");
        }

        return await this.applyStockChange(
            {
                productId,
                warehouseId,
                locationId,
                quantityDelta: -quantity,
                movementType: StockMovementType.DELIVERY,
                reference,
                notes,
            },
            userId
        );
    }

    /**
     * Adjust stock to specific quantity
     */
    async adjustStock(data: AdjustStockDto, userId: string) {
        // Get current stock level
        const currentStock = await prisma.stockLevel.findUnique({
            where: {
                productId_warehouseId_locationId: {
                    productId: data.productId,
                    warehouseId: (await prisma.product.findUnique({
                        where: { id: data.productId },
                        select: { warehouseId: true },
                    }))!.warehouseId,
                    locationId: data.locationId,
                },
            },
        });

        const currentQuantity = currentStock?.quantity || 0;
        const targetQuantity = data.newQuantity ?? data.quantity ?? currentQuantity;
        const quantityDelta = targetQuantity - currentQuantity;

        if (quantityDelta === 0) {
            throw new Error("New quantity is same as current quantity");
        }

        const product = await prisma.product.findUnique({
            where: { id: data.productId },
        });

        return await this.applyStockChange(
            {
                productId: data.productId,
                warehouseId: product!.warehouseId,
                locationId: data.locationId,
                quantityDelta,
                movementType: StockMovementType.ADJUSTMENT,
                reference: data.reference || data.reason,
                notes: data.notes || `Adjusted from ${currentQuantity} to ${targetQuantity}`,
            },
            userId
        );
    }

    /**
     * Transfer stock between locations
     */
    async transferStock(data: TransferStockDto, userId: string) {
        if (data.quantity <= 0) {
            throw new Error("Transfer quantity must be positive");
        }

        if (data.fromLocationId === data.toLocationId) {
            throw new Error("Cannot transfer to the same location");
        }

        return await prisma.$transaction(async (tx) => {
            // Validate product
            const product = await tx.product.findUnique({
                where: { id: data.productId },
            });

            if (!product || !product.isActive) {
                throw new Error("Product not found or inactive");
            }

            // Validate both locations belong to same warehouse
            const [fromLocation, toLocation] = await Promise.all([
                tx.location.findUnique({ where: { id: data.fromLocationId } }),
                tx.location.findUnique({ where: { id: data.toLocationId } }),
            ]);

            if (!fromLocation || !fromLocation.isActive) {
                throw new Error("Source location not found or inactive");
            }

            if (!toLocation || !toLocation.isActive) {
                throw new Error("Destination location not found or inactive");
            }

            if (fromLocation.warehouseId !== toLocation.warehouseId) {
                throw new Error("Locations must be in the same warehouse");
            }

            const warehouseId = fromLocation.warehouseId;

            // Transfer out from source location
            const transferOut = await this.applyStockChange(
                {
                    productId: data.productId,
                    warehouseId,
                    locationId: data.fromLocationId,
                    quantityDelta: -data.quantity,
                    movementType: StockMovementType.TRANSFER_OUT,
                    reference: data.reference,
                    notes: data.notes || `Transfer to ${toLocation.name}`,
                },
                userId
            );

            // Transfer in to destination location
            const transferIn = await this.applyStockChange(
                {
                    productId: data.productId,
                    warehouseId,
                    locationId: data.toLocationId,
                    quantityDelta: data.quantity,
                    movementType: StockMovementType.TRANSFER_IN,
                    reference: data.reference,
                    notes: data.notes || `Transfer from ${fromLocation.name}`,
                },
                userId
            );

            return {
                transferOut,
                transferIn,
                fromLocation,
                toLocation,
            };
        });
    }

    /**
     * Get stock movements with filters
     */
    async getStockMovements(options: {
        warehouseId?: string;
        productId?: string;
        locationId?: string;
        userId?: string;
        type?: StockMovementType;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }) {
        const where: any = {};

        if (options.warehouseId) where.warehouseId = options.warehouseId;
        if (options.productId) where.productId = options.productId;
        if (options.locationId) where.locationId = options.locationId;
        if (options.userId) where.userId = options.userId;
        if (options.type) where.type = options.type;

        if (options.startDate || options.endDate) {
            where.createdAt = {};
            if (options.startDate) where.createdAt.gte = options.startDate;
            if (options.endDate) where.createdAt.lte = options.endDate;
        }

        const [movements, total] = await Promise.all([
            prisma.stockMovement.findMany({
                where,
                include: {
                    product: {
                        include: {
                            category: true,
                        },
                    },
                    location: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: options.limit || 100,
                skip: options.offset || 0,
            }),
            prisma.stockMovement.count({ where }),
        ]);

        return {
            movements,
            total,
            limit: options.limit || 100,
            offset: options.offset || 0,
        };
    }

    /**
     * Get current stock levels for a warehouse
     */
    async getStockLevels(
        warehouseId: string,
        options?: {
            productId?: string;
            locationId?: string;
            includeZero?: boolean;
        }
    ) {
        const where: any = {
            warehouseId,
        };

        if (options?.productId) where.productId = options.productId;
        if (options?.locationId) where.locationId = options.locationId;
        if (!options?.includeZero) {
            where.quantity = { gt: 0 };
        }

        return await prisma.stockLevel.findMany({
            where,
            include: {
                product: {
                    include: {
                        category: true,
                    },
                },
                location: true,
            },
            orderBy: [
                { product: { name: "asc" } },
                { location: { code: "asc" } },
            ],
        });
    }

    /**
     * Get low stock alerts
     */
    async getLowStockAlerts(warehouseId: string) {
        // Get all products with reorder level set
        const products = await prisma.product.findMany({
            where: {
                warehouseId,
                isActive: true,
                reorderLevel: {
                    gt: 0,
                },
            },
            include: {
                category: true,
                stockLevels: {
                    include: {
                        location: true,
                    },
                },
            },
        });

        // Filter products below reorder level
        const alerts = products
            .map((product) => {
                const totalStock = product.stockLevels.reduce(
                    (sum, level) => sum + level.quantity,
                    0
                );

                return {
                    product,
                    totalStock,
                    reorderLevel: product.reorderLevel,
                    deficit: product.reorderLevel - totalStock,
                    stockByLocation: product.stockLevels,
                };
            })
            .filter((alert) => alert.totalStock <= alert.reorderLevel);

        return alerts;
    }

    /**
     * Get stock summary for warehouse
     */
    async getWarehouseStockSummary(warehouseId: string) {
        const [totalProducts, totalLocations, stockLevels, recentMovements] =
            await Promise.all([
                prisma.product.count({
                    where: { warehouseId, isActive: true },
                }),
                prisma.location.count({
                    where: { warehouseId, isActive: true },
                }),
                prisma.stockLevel.findMany({
                    where: { warehouseId },
                }),
                prisma.stockMovement.findMany({
                    where: { warehouseId },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                    include: {
                        product: true,
                        location: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                }),
            ]);

        const totalStockValue = stockLevels.reduce(
            (sum, level) => sum + level.quantity,
            0
        );

        const locationsWithStock = new Set(
            stockLevels.filter((l) => l.quantity > 0).map((l) => l.locationId)
        ).size;

        return {
            totalProducts,
            totalLocations,
            locationsWithStock,
            totalStockValue,
            recentMovements,
        };
    }
}
