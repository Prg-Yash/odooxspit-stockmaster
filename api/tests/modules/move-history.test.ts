import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { setupTestDatabase, teardownTestDatabase, prisma } from '../setup/test-db';
import { seedTestDatabase, type SeededData } from '../setup/seed';
import { getTestApp, getOwnerTokens, getManagerTokens, getStaffTokens, authHeader } from '../setup/auth-helper';

let seededData: SeededData;
let app: ReturnType<typeof getTestApp>;
let ownerToken: string;
let managerToken: string;
let staffToken: string;
let movementId: string;

describe('Move History API', () => {
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

        // Create a test movement
        const movement = await prisma.stockMovement.create({
            data: {
                type: 'RECEIPT',
                quantity: 10,
                productId: seededData.products.laptop.id,
                warehouseId: seededData.warehouses.main.id,
                locationId: seededData.locations.mainStorage.id,
                userId: seededData.users.owner.id,
                reference: 'TEST-MOVE-001',
                notes: 'Test movement',
                status: 'PENDING',
            },
        });
        movementId = movement.id;
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    describe('GET /moves', () => {
        it('should get all movements', async () => {
            const response = await request(app)
                .get('/moves')
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('movements');
            expect(Array.isArray(response.body.movements)).toBe(true);
        });

        it('should filter movements by product', async () => {
            const response = await request(app)
                .get(`/moves?productId=${seededData.products.laptop.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.movements).toBeDefined();
            response.body.movements.forEach((movement: any) => {
                expect(movement.productId).toBe(seededData.products.laptop.id);
            });
        });

        it('should filter movements by warehouse', async () => {
            const response = await request(app)
                .get(`/moves?warehouseId=${seededData.warehouses.main.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.movements).toBeDefined();
        });

        it('should filter movements by type', async () => {
            const response = await request(app)
                .get('/moves?type=RECEIPT')
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            response.body.movements.forEach((movement: any) => {
                expect(movement.type).toBe('RECEIPT');
            });
        });

        it('should filter movements by status', async () => {
            const response = await request(app)
                .get('/moves?status=PENDING')
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            response.body.movements.forEach((movement: any) => {
                expect(movement.status).toBe('PENDING');
            });
        });

        it('should filter movements by date range', async () => {
            const startDate = new Date('2024-01-01').toISOString();
            const endDate = new Date().toISOString();

            const response = await request(app)
                .get(`/moves?startDate=${startDate}&endDate=${endDate}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.movements).toBeDefined();
        });

        it('should paginate movements', async () => {
            const response = await request(app)
                .get('/moves?limit=5&offset=0')
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.movements.length).toBeLessThanOrEqual(5);
        });
    });

    describe('GET /moves/:id', () => {
        it('should get movement by id', async () => {
            const response = await request(app)
                .get(`/moves/${movementId}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(movementId);
            expect(response.body).toHaveProperty('product');
            expect(response.body).toHaveProperty('location');
            expect(response.body).toHaveProperty('user');
        });

        it('should return 404 for non-existent movement', async () => {
            const response = await request(app)
                .get('/moves/non-existent-id')
                .set(authHeader(ownerToken));

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /moves/:id/status', () => {
        it('should update movement status as owner', async () => {
            const response = await request(app)
                .patch(`/moves/${movementId}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'APPROVED' });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('APPROVED');
        });

        it('should update movement status as manager', async () => {
            // Create a new movement for manager test
            const movement = await prisma.stockMovement.create({
                data: {
                    type: 'DELIVERY',
                    quantity: 5,
                    productId: seededData.products.mouse.id,
                    warehouseId: seededData.warehouses.main.id,
                    locationId: seededData.locations.mainStorage.id,
                    userId: seededData.users.manager.id,
                    reference: 'MGR-MOVE-001',
                    status: 'PENDING',
                },
            });

            const response = await request(app)
                .patch(`/moves/${movement.id}/status`)
                .set(authHeader(managerToken))
                .send({ status: 'APPROVED' });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('APPROVED');
        });

        it('should block status update as staff', async () => {
            const response = await request(app)
                .patch(`/moves/${movementId}/status`)
                .set(authHeader(staffToken))
                .send({ status: 'REJECTED' });

            expect(response.status).toBe(403);
        });

        it('should update to REJECTED status', async () => {
            // Create a new movement for rejection test
            const movement = await prisma.stockMovement.create({
                data: {
                    type: 'ADJUSTMENT',
                    quantity: 3,
                    productId: seededData.products.laptop.id,
                    warehouseId: seededData.warehouses.main.id,
                    locationId: seededData.locations.mainStorage.id,
                    userId: seededData.users.owner.id,
                    reference: 'REJ-MOVE-001',
                    status: 'PENDING',
                },
            });

            const response = await request(app)
                .patch(`/moves/${movement.id}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'REJECTED' });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('REJECTED');
        });
    });

    describe('GET /moves/summary/:warehouseId', () => {
        it('should get warehouse movement summary', async () => {
            const response = await request(app)
                .get(`/moves/summary/${seededData.warehouses.main.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('totalMovements');
            expect(response.body).toHaveProperty('byType');
            expect(response.body).toHaveProperty('byStatus');
            expect(response.body.byType).toHaveProperty('RECEIPT');
            expect(response.body.byType).toHaveProperty('DELIVERY');
            expect(response.body.byType).toHaveProperty('ADJUSTMENT');
            expect(response.body.byType).toHaveProperty('TRANSFER_IN');
            expect(response.body.byType).toHaveProperty('TRANSFER_OUT');
        });

        it('should filter summary by date range', async () => {
            const startDate = new Date('2024-01-01').toISOString();
            const endDate = new Date().toISOString();

            const response = await request(app)
                .get(`/moves/summary/${seededData.warehouses.main.id}?startDate=${startDate}&endDate=${endDate}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('totalMovements');
        });
    });

    describe('GET /moves/vendor/:vendorId', () => {
        it('should get vendor movements', async () => {
            const response = await request(app)
                .get(`/moves/vendor/${seededData.vendors.supplier1.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('receipts');
            expect(response.body).toHaveProperty('deliveries');
            expect(Array.isArray(response.body.receipts)).toBe(true);
            expect(Array.isArray(response.body.deliveries)).toBe(true);
        });
    });

    describe('Movement Type Tests', () => {
        it('should handle RECEIPT movement', async () => {
            const movement = await prisma.stockMovement.create({
                data: {
                    type: 'RECEIPT',
                    quantity: 15,
                    productId: seededData.products.laptop.id,
                    warehouseId: seededData.warehouses.main.id,
                    locationId: seededData.locations.mainStorage.id,
                    userId: seededData.users.owner.id,
                    reference: 'RECEIPT-001',
                    status: 'PENDING',
                },
            });

            const response = await request(app)
                .get(`/moves/${movement.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.type).toBe('RECEIPT');
        });

        it('should handle DELIVERY movement', async () => {
            const movement = await prisma.stockMovement.create({
                data: {
                    type: 'DELIVERY',
                    quantity: 8,
                    productId: seededData.products.mouse.id,
                    warehouseId: seededData.warehouses.main.id,
                    locationId: seededData.locations.mainStorage.id,
                    userId: seededData.users.manager.id,
                    reference: 'DELIVERY-001',
                    status: 'APPROVED',
                },
            });

            const response = await request(app)
                .get(`/moves/${movement.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.type).toBe('DELIVERY');
        });

        it('should handle ADJUSTMENT movement', async () => {
            const movement = await prisma.stockMovement.create({
                data: {
                    type: 'ADJUSTMENT',
                    quantity: 20,
                    productId: seededData.products.laptop.id,
                    warehouseId: seededData.warehouses.main.id,
                    locationId: seededData.locations.mainStorage.id,
                    userId: seededData.users.owner.id,
                    reference: 'ADJUST-001',
                    notes: 'Physical count',
                    status: 'APPROVED',
                },
            });

            const response = await request(app)
                .get(`/moves/${movement.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.type).toBe('ADJUSTMENT');
        });

        it('should handle TRANSFER movements', async () => {
            const transferOut = await prisma.stockMovement.create({
                data: {
                    type: 'TRANSFER_OUT',
                    quantity: 5,
                    productId: seededData.products.mouse.id,
                    warehouseId: seededData.warehouses.main.id,
                    locationId: seededData.locations.mainStorage.id,
                    userId: seededData.users.manager.id,
                    reference: 'TRF-001',
                    status: 'APPROVED',
                },
            });

            const transferIn = await prisma.stockMovement.create({
                data: {
                    type: 'TRANSFER_IN',
                    quantity: 5,
                    productId: seededData.products.mouse.id,
                    warehouseId: seededData.warehouses.main.id,
                    locationId: seededData.locations.secondaryStorage.id,
                    userId: seededData.users.manager.id,
                    reference: 'TRF-001',
                    status: 'APPROVED',
                },
            });

            const outResponse = await request(app)
                .get(`/moves/${transferOut.id}`)
                .set(authHeader(ownerToken));

            const inResponse = await request(app)
                .get(`/moves/${transferIn.id}`)
                .set(authHeader(ownerToken));

            expect(outResponse.status).toBe(200);
            expect(outResponse.body.type).toBe('TRANSFER_OUT');
            expect(inResponse.status).toBe(200);
            expect(inResponse.body.type).toBe('TRANSFER_IN');
        });
    });
});
