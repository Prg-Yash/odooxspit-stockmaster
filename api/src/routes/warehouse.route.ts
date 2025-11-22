import { Router } from "express";
import { WarehouseController } from "../controllers/warehouse.controller";
import { requireAuth } from "../middlewares/require-auth";
import {
    requireWarehouseAccess,
    requireWarehouseManager,
    requireOwner,
} from "../middlewares/require-warehouse-role";

const router = Router();
const warehouseController = new WarehouseController();

// All warehouse routes require authentication
router.use(requireAuth);

// User leaves their current warehouse
router.post("/leave", warehouseController.leaveWarehouse.bind(warehouseController));

// Warehouse CRUD
router.post(
    "/",
    requireOwner,
    warehouseController.createWarehouse.bind(warehouseController)
);
router.get("/", warehouseController.getWarehouses.bind(warehouseController));
router.get(
    "/:warehouseId",
    requireWarehouseAccess,
    warehouseController.getWarehouse.bind(warehouseController)
);
router.put(
    "/:warehouseId",
    requireWarehouseManager,
    warehouseController.updateWarehouse.bind(warehouseController)
);
router.delete(
    "/:warehouseId",
    requireWarehouseManager,
    warehouseController.deleteWarehouse.bind(warehouseController)
);

// Warehouse Members
router.get(
    "/:warehouseId/members",
    requireWarehouseAccess,
    warehouseController.getMembers.bind(warehouseController)
);
router.post(
    "/:warehouseId/members",
    requireWarehouseManager,
    warehouseController.addMember.bind(warehouseController)
);
router.put(
    "/:warehouseId/members/:userId",
    requireWarehouseManager,
    warehouseController.updateMember.bind(warehouseController)
);
router.delete(
    "/:warehouseId/members/:userId",
    requireWarehouseManager,
    warehouseController.removeMember.bind(warehouseController)
);

// Locations
router.get(
    "/:warehouseId/locations",
    requireWarehouseAccess,
    warehouseController.getLocations.bind(warehouseController)
);
router.post(
    "/:warehouseId/locations",
    requireWarehouseManager,
    warehouseController.createLocation.bind(warehouseController)
);
router.put(
    "/:warehouseId/locations/:locationId",
    requireWarehouseManager,
    warehouseController.updateLocation.bind(warehouseController)
);
router.delete(
    "/:warehouseId/locations/:locationId",
    requireWarehouseManager,
    warehouseController.deleteLocation.bind(warehouseController)
);

export { router as warehouseRouter };
