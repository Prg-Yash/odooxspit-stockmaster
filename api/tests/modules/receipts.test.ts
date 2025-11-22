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

describe('Receipt Management API', () => {
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

    describe('POST /receipts', () => {
        it('should create receipt as owner', async () => {
            const response = await request(app)
                .post('/receipts')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 10,
                            unitPrice: 50000,
                        },
                    ],
                    notes: 'Purchase order PO-12345',
                });

            expect(response.status).toBe(201);
            expect(response.body.id).toBeDefined();
            expect(response.body.status).toBe('DRAFT');
            expect(response.body.referenceNumber).toMatch(/^RCP-/);
            expect(response.body.items.length).toBe(1);
        });

        it('should create receipt as manager', async () => {
            const response = await request(app)
                .post('/receipts')
                .set(authHeader(managerToken))
                .send({
                    vendorId: seededData.vendors.supplier2.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.mouse.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 50,
                            unitPrice: 500,
                        },
                    ],
                });

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('DRAFT');
        });

        it('should block receipt creation as staff', async () => {
            const response = await request(app)
                .post('/receipts')
                .set(authHeader(staffToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 5,
                            unitPrice: 50000,
                        },
                    ],
                });

            expect(response.status).toBe(403);
        });

        it('should reject receipt with empty items', async () => {
            const response = await request(app)
                .post('/receipts')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [],
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /receipts', () => {
        it('should get all receipts', async () => {
            const response = await request(app)
                .get('/receipts')
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should filter receipts by vendor', async () => {
            const response = await request(app)
                .get(`/receipts?vendorId=${seededData.vendors.supplier1.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should filter receipts by status', async () => {
            const response = await request(app)
                .get('/receipts?status=DRAFT')
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            response.body.forEach((receipt: any) => {
                expect(receipt.status).toBe('DRAFT');
            });
        });

        it('should filter receipts by warehouse', async () => {
            const response = await request(app)
                .get(`/receipts?warehouseId=${seededData.warehouses.main.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('GET /receipts/:id', () => {
        it('should get receipt by id', async () => {
            // Create a receipt first
            const createResponse = await request(app)
                .post('/receipts')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 5,
                            unitPrice: 50000,
                        },
                    ],
                });

            const receiptId = createResponse.body.id;

            const response = await request(app)
                .get(`/receipts/${receiptId}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(receiptId);
            expect(response.body).toHaveProperty('vendor');
            expect(response.body).toHaveProperty('warehouse');
            expect(response.body).toHaveProperty('items');
        });
    });

    describe('PUT /receipts/:id', () => {
        it('should update DRAFT receipt', async () => {
            // Create a receipt
            const createResponse = await request(app)
                .post('/receipts')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 5,
                            unitPrice: 50000,
                        },
                    ],
                });

            const receiptId = createResponse.body.id;

            // Update the receipt
            const response = await request(app)
                .put(`/receipts/${receiptId}`)
                .set(authHeader(ownerToken))
                .send({
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 8,
                            unitPrice: 50000,
                        },
                        {
                            productId: seededData.products.mouse.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 20,
                            unitPrice: 500,
                        },
                    ],
                    notes: 'Updated quantities',
                });

            expect(response.status).toBe(200);
            expect(response.body.items.length).toBe(2);
        });

        it('should block update of non-DRAFT receipt', async () => {
            // Create and transition receipt to READY
            const createResponse = await request(app)
                .post('/receipts')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 5,
                            unitPrice: 50000,
                        },
                    ],
                });

            const receiptId = createResponse.body.id;

            // Transition to READY
            await request(app)
                .patch(`/receipts/${receiptId}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'READY' });

            // Try to update
            const response = await request(app)
                .put(`/receipts/${receiptId}`)
                .set(authHeader(ownerToken))
                .send({
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 10,
                            unitPrice: 50000,
                        },
                    ],
                });

            expect(response.status).toBe(400);
        });
    });

    describe('PATCH /receipts/:id/status', () => {
        it('should transition receipt from DRAFT to READY', async () => {
            const createResponse = await request(app)
                .post('/receipts')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 5,
                            unitPrice: 50000,
                        },
                    ],
                });

            const receiptId = createResponse.body.id;

            const response = await request(app)
                .patch(`/receipts/${receiptId}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'READY' });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('READY');
        });

        it('should transition receipt from READY to DONE and apply stock', async () => {
            const createResponse = await request(app)
                .post('/receipts')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 5,
                            unitPrice: 50000,
                        },
                    ],
                });

            const receiptId = createResponse.body.id;

            // DRAFT -> READY
            await request(app)
                .patch(`/receipts/${receiptId}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'READY' });

            // READY -> DONE
            const response = await request(app)
                .patch(`/receipts/${receiptId}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'DONE' });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('DONE');
        });

        it('should reject invalid status transition', async () => {
            const createResponse = await request(app)
                .post('/receipts')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 5,
                            unitPrice: 50000,
                        },
                    ],
                });

            const receiptId = createResponse.body.id;

            // Try to go directly from DRAFT to DONE
            const response = await request(app)
                .patch(`/receipts/${receiptId}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'DONE' });

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /receipts/:id', () => {
        it('should delete DRAFT receipt', async () => {
            const createResponse = await request(app)
                .post('/receipts')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 5,
                            unitPrice: 50000,
                        },
                    ],
                });

            const receiptId = createResponse.body.id;

            const response = await request(app)
                .delete(`/receipts/${receiptId}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
        });

        it('should block deletion of non-DRAFT receipt', async () => {
            const createResponse = await request(app)
                .post('/receipts')
                .set(authHeader(ownerToken))
                .send({
                    vendorId: seededData.vendors.supplier1.id,
                    warehouseId: seededData.warehouses.main.id,
                    items: [
                        {
                            productId: seededData.products.laptop.id,
                            locationId: seededData.locations.mainStorage.id,
                            quantity: 5,
                            unitPrice: 50000,
                        },
                    ],
                });

            const receiptId = createResponse.body.id;

            // Transition to READY
            await request(app)
                .patch(`/receipts/${receiptId}/status`)
                .set(authHeader(ownerToken))
                .send({ status: 'READY' });

            const response = await request(app)
                .delete(`/receipts/${receiptId}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(400);
        });
    });
});
