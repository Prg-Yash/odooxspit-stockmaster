import type { Request, Response } from "express";
import { WarehouseService } from "../services/warehouse.service";
import {
    createWarehouseSchema,
    updateWarehouseSchema,
    addWarehouseMemberSchema,
    updateWarehouseMemberSchema,
    createLocationSchema,
    updateLocationSchema,
} from "../types/warehouse.types";
import type { WarehouseAuthRequest } from "../middlewares/require-warehouse-role";
import { Prisma } from "../generated/prisma/client";
import { ZodError } from "zod";

const warehouseService = new WarehouseService();

/**
 * Handle Prisma errors and return user-friendly messages
 */
function handlePrismaError(error: any): { status: number; message: string } {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                // Unique constraint violation
                const field = (error.meta?.target as string[])?.[0] || "field";
                return {
                    status: 409,
                    message: `A warehouse with this ${field} already exists. Please use a different ${field}.`,
                };
            case "P2003":
                // Foreign key constraint violation
                return {
                    status: 400,
                    message: "Referenced record not found. Please check the provided IDs.",
                };
            case "P2025":
                // Record not found
                return {
                    status: 404,
                    message: "Record not found.",
                };
            default:
                return {
                    status: 400,
                    message: "Database operation failed. Please check your input.",
                };
        }
    }

    if (error instanceof ZodError) {
        const messages = error.issues.map((e) => e.message).join(", ");
        return {
            status: 400,
            message: `Validation failed: ${messages}`,
        };
    }

    return {
        status: 500,
        message: error.message || "An unexpected error occurred.",
    };
}

export class WarehouseController {
    /**
     * Create warehouse
     */
    async createWarehouse(req: Request, res: Response) {
        try {
            const validatedData = createWarehouseSchema.parse(req.body);
            const warehouse = await warehouseService.createWarehouse(validatedData);

            return res.status(201).json({
                success: true,
                message: "Warehouse created successfully.",
                data: { warehouse },
            });
        } catch (error: any) {
            console.error("Create warehouse error:", error);
            const { status, message } = handlePrismaError(error);
            return res.status(status).json({
                success: false,
                message,
            });
        }
    }

    /**
     * Get all warehouses for user
     */
    async getWarehouses(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            const warehouses = await warehouseService.getWarehousesByUser(
                userId,
                userRole
            );

            return res.status(200).json({
                success: true,
                data: warehouses,
            });
        } catch (error: any) {
            console.error("Get warehouses error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch warehouses",
            });
        }
    }

    /**
     * Get warehouse by ID
     */
    async getWarehouse(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            const warehouse = await warehouseService.getWarehouseById(warehouseId);

            if (!warehouse) {
                return res.status(404).json({
                    success: false,
                    message: "Warehouse not found",
                });
            }

            return res.status(200).json({
                success: true,
                data: warehouse,
            });
        } catch (error: any) {
            console.error("Get warehouse error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch warehouse",
            });
        }
    }

    /**
     * Update warehouse
     */
    async updateWarehouse(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            const validatedData = updateWarehouseSchema.parse(req.body);

            const warehouse = await warehouseService.updateWarehouse(
                warehouseId,
                validatedData
            );

            return res.status(200).json({
                success: true,
                message: "Warehouse updated successfully.",
                data: { warehouse },
            });
        } catch (error: any) {
            console.error("Update warehouse error:", error);
            const { status, message } = handlePrismaError(error);
            return res.status(status).json({
                success: false,
                message,
            });
        }
    }

    /**
     * Delete warehouse
     */
    async deleteWarehouse(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            await warehouseService.deleteWarehouse(warehouseId);

            return res.status(200).json({
                success: true,
                message: "Warehouse deleted successfully",
            });
        } catch (error: any) {
            console.error("Delete warehouse error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to delete warehouse",
            });
        }
    }

    /**
     * Add member to warehouse
     */
    async addMember(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            const validatedData = addWarehouseMemberSchema.parse(req.body);

            const member = await warehouseService.addMember(
                warehouseId,
                validatedData
            );

            return res.status(201).json({
                success: true,
                message: "Member added successfully.",
                data: { member },
            });
        } catch (error: any) {
            console.error("Add member error:", error);

            // Handle specific case where user is in another warehouse
            if (error.code === "ALREADY_IN_WAREHOUSE") {
                return res.status(409).json({
                    success: false,
                    message: error.message,
                    code: "ALREADY_IN_WAREHOUSE",
                    existingWarehouse: error.existingWarehouse,
                });
            }

            const { status, message } = handlePrismaError(error);
            return res.status(status).json({
                success: false,
                message,
            });
        }
    }

    /**
     * Update member role
     */
    async updateMember(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId, userId } = req.params;
            if (!warehouseId || !userId) {
                return res.status(400).json({ success: false, message: "Warehouse ID and User ID required" });
            }
            const validatedData = updateWarehouseMemberSchema.parse(req.body);

            const member = await warehouseService.updateMember(
                warehouseId,
                userId,
                validatedData
            );

            return res.status(200).json({
                success: true,
                message: "Member role updated successfully",
                data: member,
            });
        } catch (error: any) {
            console.error("Update member error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to update member",
            });
        }
    }

    /**
     * Remove member from warehouse
     */
    async removeMember(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId, userId } = req.params;
            if (!warehouseId || !userId) {
                return res.status(400).json({ success: false, message: "Warehouse ID and User ID required" });
            }
            await warehouseService.removeMember(warehouseId, userId);

            return res.status(200).json({
                success: true,
                message: "Member removed successfully",
            });
        } catch (error: any) {
            console.error("Remove member error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to remove member",
            });
        }
    }

    /**
     * Leave current warehouse (user removes themselves)
     */
    async leaveWarehouse(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const result = await warehouseService.leaveWarehouse(userId);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    leftWarehouse: result.warehouse,
                },
            });
        } catch (error: any) {
            console.error("Leave warehouse error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to leave warehouse",
            });
        }
    }

    /**
     * Get warehouse members
     */
    async getMembers(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            const members = await warehouseService.getMembers(warehouseId);

            return res.status(200).json({
                success: true,
                data: members,
            });
        } catch (error: any) {
            console.error("Get members error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch members",
            });
        }
    }

    /**
     * Create location in warehouse
     */
    async createLocation(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            const validatedData = createLocationSchema.parse(req.body);

            const location = await warehouseService.createLocation(
                warehouseId,
                validatedData
            );

            return res.status(201).json({
                success: true,
                message: "Location created successfully.",
                data: { location },
            });
        } catch (error: any) {
            console.error("Create location error:", error);
            const { status, message } = handlePrismaError(error);
            return res.status(status).json({
                success: false,
                message,
            });
        }
    }

    /**
     * Get locations in warehouse
     */
    async getLocations(req: WarehouseAuthRequest, res: Response) {
        try {
            const { warehouseId } = req.params;
            if (!warehouseId) {
                return res.status(400).json({ success: false, message: "Warehouse ID required" });
            }
            const locations = await warehouseService.getLocations(warehouseId);

            return res.status(200).json({
                success: true,
                data: locations,
            });
        } catch (error: any) {
            console.error("Get locations error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch locations",
            });
        }
    }

    /**
     * Update location
     */
    async updateLocation(req: WarehouseAuthRequest, res: Response) {
        try {
            const { locationId } = req.params;
            if (!locationId) {
                return res.status(400).json({ success: false, message: "Location ID required" });
            }
            const validatedData = updateLocationSchema.parse(req.body);

            const location = await warehouseService.updateLocation(
                locationId,
                validatedData
            );

            return res.status(200).json({
                success: true,
                message: "Location updated successfully",
                data: location,
            });
        } catch (error: any) {
            console.error("Update location error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to update location",
            });
        }
    }

    /**
     * Delete location
     */
    async deleteLocation(req: WarehouseAuthRequest, res: Response) {
        try {
            const { locationId } = req.params;
            if (!locationId) {
                return res.status(400).json({ success: false, message: "Location ID required" });
            }
            await warehouseService.deleteLocation(locationId);

            return res.status(200).json({
                success: true,
                message: "Location deleted successfully",
            });
        } catch (error: any) {
            console.error("Delete location error:", error);
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to delete location",
            });
        }
    }
}
