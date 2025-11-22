import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { WarehouseMemberRole } from "../generated/prisma/enums";

export interface WarehouseAuthRequest extends Request {
    warehouseMember?: {
        warehouseId: string;
        userId: string;
        role: WarehouseMemberRole;
    };
}

/**
 * Middleware to check if user has specific role in a warehouse
 * @param allowedRoles Array of allowed warehouse member roles
 */
export const requireWarehouseRole = (
    allowedRoles: WarehouseMemberRole[]
) => {
    return async (
        req: WarehouseAuthRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userId = req.user?.id;
            const warehouseId = req.params.warehouseId || req.body.warehouseId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
            }

            if (!warehouseId) {
                return res.status(400).json({
                    success: false,
                    message: "Warehouse ID is required",
                });
            }

            // Check if user is system OWNER (has access to all warehouses)
            if (req.user?.role === "OWNER") {
                // Attach a virtual warehouse member for consistency
                req.warehouseMember = {
                    warehouseId,
                    userId,
                    role: WarehouseMemberRole.MANAGER,
                };
                return next();
            }

            // Check warehouse membership
            const member = await prisma.warehouseMember.findUnique({
                where: {
                    warehouseId_userId: {
                        warehouseId,
                        userId,
                    },
                },
            });

            if (!member) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have access to this warehouse",
                });
            }

            if (!allowedRoles.includes(member.role)) {
                return res.status(403).json({
                    success: false,
                    message: `This action requires one of the following roles: ${allowedRoles.join(", ")}`,
                });
            }

            // Attach warehouse member info to request
            req.warehouseMember = {
                warehouseId: member.warehouseId,
                userId: member.userId,
                role: member.role,
            };

            next();
        } catch (error) {
            console.error("Warehouse authorization error:", error);
            return res.status(500).json({
                success: false,
                message: "Authorization check failed",
            });
        }
    };
};

/**
 * Middleware to check if user has access to a warehouse (any role)
 */
export const requireWarehouseAccess = requireWarehouseRole([
    WarehouseMemberRole.MANAGER,
    WarehouseMemberRole.STAFF,
]);

/**
 * Middleware to check if user is a warehouse manager
 */
export const requireWarehouseManager = requireWarehouseRole([
    WarehouseMemberRole.MANAGER,
]);
