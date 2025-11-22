import { prisma } from "../lib/prisma";
import type {
    CreateWarehouseDto,
    UpdateWarehouseDto,
    AddWarehouseMemberDto,
    UpdateWarehouseMemberDto,
    CreateLocationDto,
    UpdateLocationDto,
} from "../types/warehouse.types";
import { UserRole } from "../generated/prisma/enums";

export class WarehouseService {
    /**
     * Create a new warehouse
     */
    async createWarehouse(data: CreateWarehouseDto) {
        return await prisma.warehouse.create({
            data,
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Get warehouse by ID
     */
    async getWarehouseById(id: string) {
        return await prisma.warehouse.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
                locations: {
                    where: { isActive: true },
                },
                _count: {
                    select: {
                        products: true,
                        stockLevels: true,
                    },
                },
            },
        });
    }

    /**
     * Get all warehouses accessible to user
     */
    async getWarehousesByUser(userId: string, userRole: UserRole) {
        // System owners can see all warehouses
        if (userRole === UserRole.OWNER) {
            return await prisma.warehouse.findMany({
                where: { isActive: true },
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            products: true,
                            locations: true,
                        },
                    },
                },
                orderBy: { name: "asc" },
            });
        }

        // Other users see only warehouses they're members of
        return await prisma.warehouse.findMany({
            where: {
                isActive: true,
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        products: true,
                        locations: true,
                    },
                },
            },
            orderBy: { name: "asc" },
        });
    }

    /**
     * Update warehouse
     */
    async updateWarehouse(id: string, data: UpdateWarehouseDto) {
        return await prisma.warehouse.update({
            where: { id },
            data,
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Delete warehouse (cascade deletes all related data)
     */
    async deleteWarehouse(id: string) {
        return await prisma.warehouse.delete({
            where: { id },
        });
    }

    /**
     * Add member to warehouse
     */
    async addMember(warehouseId: string, data: AddWarehouseMemberDto) {
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: data.userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Check if already a member of THIS warehouse
        const existing = await prisma.warehouseMember.findUnique({
            where: {
                warehouseId_userId: {
                    warehouseId,
                    userId: data.userId,
                },
            },
        });

        if (existing) {
            throw new Error("User is already a member of this warehouse");
        }

        // Check if user is member of ANY other warehouse
        const otherMembership = await prisma.warehouseMember.findFirst({
            where: {
                userId: data.userId,
            },
            include: {
                warehouse: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });

        if (otherMembership) {
            const error: any = new Error(
                `User is already a member of warehouse "${otherMembership.warehouse.name}" (${otherMembership.warehouse.code}). They must leave that warehouse first.`
            );
            error.code = "ALREADY_IN_WAREHOUSE";
            error.existingWarehouse = {
                id: otherMembership.warehouse.id,
                name: otherMembership.warehouse.name,
                code: otherMembership.warehouse.code,
            };
            throw error;
        }

        return await prisma.warehouseMember.create({
            data: {
                warehouseId,
                userId: data.userId,
                role: data.role,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                    },
                },
                warehouse: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });
    }

    /**
     * Update member role
     */
    async updateMember(
        warehouseId: string,
        userId: string,
        data: UpdateWarehouseMemberDto
    ) {
        return await prisma.warehouseMember.update({
            where: {
                warehouseId_userId: {
                    warehouseId,
                    userId,
                },
            },
            data: {
                role: data.role,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
    }

    /**
     * Remove member from warehouse
     */
    async removeMember(warehouseId: string, userId: string) {
        return await prisma.warehouseMember.delete({
            where: {
                warehouseId_userId: {
                    warehouseId,
                    userId,
                },
            },
        });
    }

    /**
     * Leave warehouse (user removes themselves)
     */
    async leaveWarehouse(userId: string) {
        // Find user's current warehouse membership
        const membership = await prisma.warehouseMember.findFirst({
            where: { userId },
            include: {
                warehouse: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });

        if (!membership) {
            throw new Error("You are not a member of any warehouse");
        }

        // Delete the membership
        await prisma.warehouseMember.delete({
            where: {
                warehouseId_userId: {
                    warehouseId: membership.warehouseId,
                    userId,
                },
            },
        });

        return {
            success: true,
            message: `Successfully left warehouse "${membership.warehouse.name}"`,
            warehouse: membership.warehouse,
        };
    }

    /**
     * Get warehouse members
     */
    async getMembers(warehouseId: string) {
        return await prisma.warehouseMember.findMany({
            where: { warehouseId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });
    }

    /**
     * Create location in warehouse
     */
    async createLocation(warehouseId: string, data: CreateLocationDto) {
        return await prisma.location.create({
            data: {
                ...data,
                warehouseId,
            },
        });
    }

    /**
     * Get locations in warehouse
     */
    async getLocations(warehouseId: string) {
        return await prisma.location.findMany({
            where: {
                warehouseId,
                isActive: true,
            },
            include: {
                _count: {
                    select: {
                        stockLevels: true,
                    },
                },
            },
            orderBy: {
                code: "asc",
            },
        });
    }

    /**
     * Update location
     */
    async updateLocation(id: string, data: UpdateLocationDto) {
        return await prisma.location.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete location
     */
    async deleteLocation(id: string) {
        // Check if location has stock
        const stockCount = await prisma.stockLevel.count({
            where: {
                locationId: id,
                quantity: {
                    gt: 0,
                },
            },
        });

        if (stockCount > 0) {
            throw new Error(
                "Cannot delete location with existing stock. Please transfer stock first."
            );
        }

        return await prisma.location.delete({
            where: { id },
        });
    }
}
