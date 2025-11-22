import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { setupTestDatabase, teardownTestDatabase } from '../setup/test-db';
import { seedTestDatabase, type SeededData } from '../setup/seed';
import { getTestApp, getOwnerTokens, getManagerTokens, getStaffTokens, authHeader } from '../setup/auth-helper';

let seededData: SeededData;
let app: ReturnType<typeof getTestApp>;
let ownerToken: string;
let managerToken: string;
let staffToken: string;

describe('Stock Management API', () => {
    beforeAll(async () => {
        app = getTestApp();
        await setupTestDatabase();
        seededData = await seedTestDatabase();

        const ownerTokens = await getOwnerTokens();
        const managerTokens = await getManagerTokens();
        const staffTokens = await getStaffTokens();

        ownerToken = ownerTokens.accessToken;
        managerToken = managerTokens.accessToken;
        staffToken = staffTokens.accessToken;
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    describe('POST /stocks/warehouse/:warehouseId/receive', () => {
        it('should receive stock as owner', async () => {
            const response = await request(app)
                .post(`/stocks/warehouse/${seededData.warehouses.main.id}/receive`)
                .set(authHeader(ownerToken))
                .send({
                    productId: seededData.products.laptop.id,
                    locationId: seededData.locations.mainStorage.id,
                    quantity: 5,
                    reference: 'PO-001',
                    notes: 'Purchase order delivery',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.movement.type).toBe('RECEIPT');
            expect(response.body.data.movement.quantity).toBe(5);
        });

        it('should receive stock as manager', async () => {
            const response = await request(app)
                .post(`/stocks/warehouse/${seededData.warehouses.main.id}/receive`)
                .set(authHeader(managerToken))
                .send({
                    productId: seededData.products.mouse.id,
                    locationId: seededData.locations.mainStorage.id,
                    quantity: 20,
                    reference: 'PO-002',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should receive stock as staff', async () => {
            const response = await request(app)
                .post(`/stocks/warehouse/${seededData.warehouses.main.id}/receive`)
                .set(authHeader(staffToken))
                .send({
                    productId: seededData.products.laptop.id,
                    locationId: seededData.locations.mainStorage.id,
                    quantity: 3,
                    reference: 'PO-003',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should reject negative quantity', async () => {
            const response = await request(app)
                .post(`/stocks/warehouse/${seededData.warehouses.main.id}/receive`)
                .set(authHeader(ownerToken))
                .send({
                    productId: seededData.products.laptop.id,
                    locationId: seededData.locations.mainStorage.id,
                    quantity: -5,
                    reference: 'PO-INVALID',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /stocks/warehouse/:warehouseId/deliver', () => {
        it('should deliver stock as owner', async () => {
            const response = await request(app)
                .post(`/stocks/warehouse/${seededData.warehouses.main.id}/deliver`)
                .set(authHeader(ownerToken))
                .send({
                    productId: seededData.products.laptop.id,
                    locationId: seededData.locations.mainStorage.id,
                    quantity: 2,
                    reference: 'SO-001',
                    notes: 'Sales order fulfillment',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.movement.type).toBe('DELIVERY');
        });

        it('should deliver stock as staff', async () => {
            const response = await request(app)
                .post(`/stocks/warehouse/${seededData.warehouses.main.id}/deliver`)
                .set(authHeader(staffToken))
                .send({
                    productId: seededData.products.mouse.id,
                    locationId: seededData.locations.mainStorage.id,
                    quantity: 5,
                    reference: 'SO-002',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should reject delivery with insufficient stock', async () => {
            const response = await request(app)
                .post(`/stocks/warehouse/${seededData.warehouses.main.id}/deliver`)
                .set(authHeader(ownerToken))
                .send({
                    productId: seededData.products.laptop.id,
                    locationId: seededData.locations.mainStorage.id,
                    quantity: 10000,
                    reference: 'SO-INVALID',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /stocks/adjust', () => {
        it('should adjust stock as owner', async () => {
            const response = await request(app)
                .post('/stocks/adjust')
                .set(authHeader(ownerToken))
                .send({
                    productId: seededData.products.laptop.id,
                    locationId: seededData.locations.mainStorage.id,
                    quantity: 15,
                    reason: 'Physical count adjustment',
                    notes: 'Annual inventory check',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.movement.type).toBe('ADJUSTMENT');
        });

        it('should adjust stock as manager', async () => {
            const response = await request(app)
                .post('/stocks/adjust')
                .set(authHeader(managerToken))
                .send({
                    productId: seededData.products.mouse.id,
                    locationId: seededData.locations.mainStorage.id,
                    quantity: 45,
                    reason: 'Correction',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should adjust stock as staff', async () => {
            const response = await request(app)
                .post('/stocks/adjust')
                .set(authHeader(staffToken))
                .send({
                    productId: seededData.products.laptop.id,
                    locationId: seededData.locations.mainStorage.id,
                    quantity: 12,
                    reason: 'Found items',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('POST /stocks/transfer', () => {
        it('should transfer stock between locations as owner', async () => {
            const response = await request(app)
                .post('/stocks/transfer')
                .set(authHeader(ownerToken))
                .send({
                    productId: seededData.products.laptop.id,
                    fromLocationId: seededData.locations.mainStorage.id,
                    toLocationId: seededData.locations.secondaryStorage.id,
                    quantity: 3,
                    reference: 'TRF-001',
                    notes: 'Reorganization',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.transferOut.type).toBe('TRANSFER_OUT');
            expect(response.body.data.transferIn.type).toBe('TRANSFER_IN');
        });

        it('should transfer stock as manager', async () => {
            const response = await request(app)
                .post('/stocks/transfer')
                .set(authHeader(managerToken))
                .send({
                    productId: seededData.products.mouse.id,
                    fromLocationId: seededData.locations.mainStorage.id,
                    toLocationId: seededData.locations.secondaryStorage.id,
                    quantity: 10,
                    reference: 'TRF-002',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should transfer stock as staff', async () => {
            const response = await request(app)
                .post('/stocks/transfer')
                .set(authHeader(staffToken))
                .send({
                    productId: seededData.products.laptop.id,
                    fromLocationId: seededData.locations.mainStorage.id,
                    toLocationId: seededData.locations.secondaryStorage.id,
                    quantity: 2,
                    reference: 'TRF-003',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should reject transfer with insufficient stock', async () => {
            const response = await request(app)
                .post('/stocks/transfer')
                .set(authHeader(ownerToken))
                .send({
                    productId: seededData.products.laptop.id,
                    fromLocationId: seededData.locations.mainStorage.id,
                    toLocationId: seededData.locations.secondaryStorage.id,
                    quantity: 10000,
                    reference: 'TRF-INVALID',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /stocks/warehouse/:warehouseId/levels', () => {
        it('should get all stock levels in warehouse', async () => {
            const response = await request(app)
                .get(`/stocks/warehouse/${seededData.warehouses.main.id}/levels`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should filter stock levels by product', async () => {
            const response = await request(app)
                .get(`/stocks/warehouse/${seededData.warehouses.main.id}/levels?productId=${seededData.products.laptop.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            response.body.data.forEach((level: any) => {
                expect(level.productId).toBe(seededData.products.laptop.id);
            });
        });

        it('should filter stock levels by location', async () => {
            const response = await request(app)
                .get(`/stocks/warehouse/${seededData.warehouses.main.id}/levels?locationId=${seededData.locations.mainStorage.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /stocks/warehouse/:warehouseId/movements', () => {
        it('should get all stock movements', async () => {
            const response = await request(app)
                .get(`/stocks/warehouse/${seededData.warehouses.main.id}/movements`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('should filter movements by product', async () => {
            const response = await request(app)
                .get(`/stocks/warehouse/${seededData.warehouses.main.id}/movements?productId=${seededData.products.laptop.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should filter movements by type', async () => {
            const response = await request(app)
                .get(`/stocks/warehouse/${seededData.warehouses.main.id}/movements?type=RECEIPT`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            response.body.data.forEach((movement: any) => {
                expect(movement.type).toBe('RECEIPT');
            });
        });
    });

    describe('GET /stocks/warehouse/:warehouseId/alerts', () => {
        it('should get low stock alerts', async () => {
            const response = await request(app)
                .get(`/stocks/warehouse/${seededData.warehouses.main.id}/alerts`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /stocks/warehouse/:warehouseId/summary', () => {
        it('should get warehouse stock summary', async () => {
            const response = await request(app)
                .get(`/stocks/warehouse/${seededData.warehouses.main.id}/summary`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('totalProducts');
            expect(response.body.data).toHaveProperty('totalLocations');
            expect(response.body.data).toHaveProperty('recentMovements');
        });
    });
});
