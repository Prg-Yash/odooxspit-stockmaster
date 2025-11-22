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

const warehouseService = new WarehouseService();

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
        message: "Warehouse created successfully",
        data: warehouse,
      });
    } catch (error: any) {
      console.error("Create warehouse error:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create warehouse",
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
        message: "Warehouse updated successfully",
        data: warehouse,
      });
    } catch (error: any) {
      console.error("Update warehouse error:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update warehouse",
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
        message: "Member added successfully",
        data: member,
      });
    } catch (error: any) {
      console.error("Add member error:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to add member",
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
        message: "Location created successfully",
        data: location,
      });
    } catch (error: any) {
      console.error("Create location error:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create location",
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
