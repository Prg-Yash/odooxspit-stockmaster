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

describe('Delivery Management API', () => {
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

    describe('POST /deliveries', () => {
        it('should create delivery to vendor as owner', async () => {
            const response = await request(app)
                .post('/deliveries')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 2,
                            unitPrice: 50000,
                        },
                    ],
                    notes: 'Sales order SO-67890',
                });

            expect(response.status).toBe(201);
            expect(response.body.id).toBeDefined();
            expect(response.body.status).toBe('DRAFT');
            expect(response.body.referenceNumber).toMatch(/^DLV-/);
            expect(response.body.items.length).toBe(1);
        });

        it('should create delivery to user as manager', async () => {
            const response = await request(app)
                .post('/deliveries')
                .set(authHeader(managerToken))
                .send({
                    userId: seededData.users.staff.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.mouse.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 5,
                            unitPrice: 500,
                        },
                    ],
                    notes: 'Internal transfer',
                });

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('DRAFT');
        });

        it('should block delivery creation as staff', async () => {
            const response = await request(app)
                .post('/deliveries')
                .set(authHeader(staffToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 1,
                            unitPrice: 50000,
                        },
                    ],
                });

            expect(response.status).toBe(403);
        });

        it('should reject delivery with empty items', async () => {
            const response = await request(app)
                .post('/deliveries')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [],
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /deliveries', () => {
        it('should get all deliveries', async () => {
            const response = await request(app)
                .get('/deliveries')
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should filter deliveries by vendor', async () => {
            const response = await request(app)
                .get(`/deliveries?vendorId=${seededData.vendors.supplier1.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should filter deliveries by status', async () => {
            const response = await request(app)
                .get('/deliveries?status=DRAFT')
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            response.body.forEach((delivery: any) => {
                expect(delivery.status).toBe('DRAFT');
            });
        });

        it('should filter deliveries by warehouse', async () => {
            const response = await request(app)
                .get(`/deliveries?warehouseId=${seededData.warehouses.main.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('GET /deliveries/:id', () => {
        it('should get delivery by id', async () => {
            // Create a delivery first
            const createResponse = await request(app)
                .post('/deliveries')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 1,
                            unitPrice: 50000,
                        },
                    ],
                });

            const deliveryId = createResponse.body.id;

            const response = await request(app)
                .get(`/deliveries/${deliveryId}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(deliveryId);
            expect(response.body).toHaveProperty('warehouse');
            expect(response.body).toHaveProperty('items');
        });
    });

    describe('PUT /deliveries/:id', () => {
        it('should update DRAFT delivery', async () => {
            // Create a delivery
            const createResponse = await request(app)
                .post('/deliveries')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 1,
                            unitPrice: 50000,
                        },
                    ],
                });

            const deliveryId = createResponse.body.id;

            // Update the delivery
            const response = await request(app)
                .put(`/deliveries/${deliveryId}`)
                .set(authHeader(ownerToken))
                .send({
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 2,
                            unitPrice: 50000,
                        },
                        {
                            productId: seededData.products.mouse.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 10,
                            unitPrice: 500,
                        },
                    ],
                    notes: 'Updated quantities',
                });

            expect(response.status).toBe(200);
            expect(response.body.items.length).toBe(2);
        });

        it('should block update of non-DRAFT delivery', async () => {
            // Create and transition delivery to READY
            const createResponse = await request(app)
                .post('/deliveries')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 1,
                            unitPrice: 50000,
                        },
                    ],
                });

            const deliveryId = createResponse.body.id;

            // Transition to READY
            await request(app)
                .patch(`/deliveries/${deliveryId}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'READY' });

            // Try to update
            const response = await request(app)
                .put(`/deliveries/${deliveryId}`)
                .set(authHeader(ownerToken))
                .send({
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 5,
                            unitPrice: 50000,
                        },
                    ],
                });

            expect(response.status).toBe(400);
        });
    });

    describe('PATCH /deliveries/:id/status', () => {
        it('should transition delivery from DRAFT to READY', async () => {
            const createResponse = await request(app)
                .post('/deliveries')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 1,
                            unitPrice: 50000,
                        },
                    ],
                });

            const deliveryId = createResponse.body.id;

            const response = await request(app)
                .patch(`/deliveries/${deliveryId}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'READY' });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('READY');
        });

        it('should transition delivery from READY to DONE and apply stock changes', async () => {
            const createResponse = await request(app)
                .post('/deliveries')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.mouse.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 5,
                            unitPrice: 500,
                        },
                    ],
                });

            const deliveryId = createResponse.body.id;

            // DRAFT -> READY
            await request(app)
                .patch(`/deliveries/${deliveryId}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'READY' });

            // READY -> DONE
            const response = await request(app)
                .patch(`/deliveries/${deliveryId}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'DONE' });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('DONE');
        });

        it('should reject transition to READY with insufficient stock', async () => {
            const createResponse = await request(app)
                .post('/deliveries')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 10000,
                            unitPrice: 50000,
                        },
                    ],
                });

            const deliveryId = createResponse.body.id;

            const response = await request(app)
                .patch(`/deliveries/${deliveryId}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'READY' });

            expect(response.status).toBe(400);
        });

        it('should reject invalid status transition', async () => {
            const createResponse = await request(app)
                .post('/deliveries')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 1,
                            unitPrice: 50000,
                        },
                    ],
                });

            const deliveryId = createResponse.body.id;

            // Try to go directly from DRAFT to DONE
            const response = await request(app)
                .patch(`/deliveries/${deliveryId}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'DONE' });

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /deliveries/:id', () => {
        it('should delete DRAFT delivery', async () => {
            const createResponse = await request(app)
                .post('/deliveries')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 1,
                            unitPrice: 50000,
                        },
                    ],
                });

            const deliveryId = createResponse.body.id;

            const response = await request(app)
                .delete(`/deliveries/${deliveryId}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
        });

        it('should block deletion of non-DRAFT delivery', async () => {
            const createResponse = await request(app)
                .post('/deliveries')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 1,
                            unitPrice: 50000,
                        },
                    ],
                });

            const deliveryId = createResponse.body.id;

            // Transition to READY
            await request(app)
                .patch(`/deliveries/${deliveryId}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'READY' });

            const response = await request(app)
                .delete(`/deliveries/${deliveryId}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(400);
        });
    });
});
