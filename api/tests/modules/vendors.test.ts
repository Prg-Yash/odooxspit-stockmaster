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

describe('Vendor API', () => {
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

    describe('POST /vendors', () => {
        it('should create vendor as owner', async () => {
            const response = await request(app)
                .post('/vendors')
                .set(authHeader(ownerToken))
                .send({
                    name: 'New Test Vendor',
                    email: 'newvendor@test.com',
                    phone: '+91-9999999999',
                    address: '123 Vendor Street',
                });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe('New Test Vendor');
            expect(response.body.email).toBe('newvendor@test.com');
        });

        it('should create vendor as manager', async () => {
            const response = await request(app)
                .post('/vendors')
                .set(authHeader(managerToken))
                .send({
                    name: 'Manager Vendor',
                    email: 'managervendor@test.com',
                    phone: '+91-8888888888',
                    address: '456 Manager Avenue',
                });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe('Manager Vendor');
        });

        it('should block vendor creation as staff', async () => {
            const response = await request(app)
                .post('/vendors')
                .set(authHeader(staffToken))
                .send({
                    name: 'Staff Vendor',
                    email: 'staffvendor@test.com',
                    phone: '+91-7777777777',
                    address: '789 Staff Road',
                });

            expect(response.status).toBe(403);
        });
    });

    describe('GET /vendors', () => {
        it('should get all vendors', async () => {
            const response = await request(app)
                .get('/vendors')
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(2);
        });

        it('should filter active vendors only', async () => {
            const response = await request(app)
                .get('/vendors?isActive=true')
                .set(authHeader(managerToken));

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach((vendor: any) => {
                expect(vendor.isActive).toBe(true);
            });
        });
    });

    describe('GET /vendors/:id', () => {
        it('should get vendor by id', async () => {
            const response = await request(app)
                .get(`/vendors/${seededData.vendors.supplier1.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(seededData.vendors.supplier1.id);
            expect(response.body.name).toBe(seededData.vendors.supplier1.name);
        });

        it('should return 404 for non-existent vendor', async () => {
            const response = await request(app)
                .get('/vendors/non-existent-id')
                .set(authHeader(ownerToken));

            expect(response.status).toBe(404);
        });
    });

    describe('GET /vendors/:id/history', () => {
        it('should get vendor transaction history', async () => {
            const response = await request(app)
                .get(`/vendors/${seededData.vendors.supplier1.id}/history`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('receipts');
            expect(response.body).toHaveProperty('deliveries');
        });
    });

    describe('PUT /vendors/:id', () => {
        it('should update vendor as owner', async () => {
            const response = await request(app)
                .put(`/vendors/${seededData.vendors.supplier1.id}`)
                .set(authHeader(ownerToken))
                .send({
                    name: 'Updated Vendor Name',
                    phone: '+91-1234567890',
                });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Updated Vendor Name');
            expect(response.body.phone).toBe('+91-1234567890');
        });

        it('should update vendor as manager', async () => {
            const response = await request(app)
                .put(`/vendors/${seededData.vendors.supplier2.id}`)
                .set(authHeader(managerToken))
                .send({
                    address: 'Updated Address',
                });

            expect(response.status).toBe(200);
            expect(response.body.address).toBe('Updated Address');
        });

        it('should block vendor update as staff', async () => {
            const response = await request(app)
                .put(`/vendors/${seededData.vendors.supplier1.id}`)
                .set(authHeader(staffToken))
                .send({
                    name: 'Staff Update',
                });

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /vendors/:id', () => {
        it('should delete vendor as owner', async () => {
            // Create a vendor to delete
            const createResponse = await request(app)
                .post('/vendors')
                .set(authHeader(ownerToken))
                .send({
                    name: 'Vendor to Delete',
                    email: 'delete@test.com',
                    phone: '+91-5555555555',
                    address: 'Delete Street',
                });

            const vendorId = createResponse.body.id;

            const response = await request(app)
                .delete(`/vendors/${vendorId}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
        });

        it('should delete vendor as manager', async () => {
            // Create a vendor to delete
            const createResponse = await request(app)
                .post('/vendors')
                .set(authHeader(managerToken))
                .send({
                    name: 'Manager Delete Vendor',
                    email: 'managerdelete@test.com',
                    phone: '+91-4444444444',
                    address: 'Manager Delete St',
                });

            const vendorId = createResponse.body.id;

            const response = await request(app)
                .delete(`/vendors/${vendorId}`)
                .set(authHeader(managerToken));

            expect(response.status).toBe(200);
        });

        it('should block vendor deletion as staff', async () => {
            const response = await request(app)
                .delete(`/vendors/${seededData.vendors.supplier1.id}`)
                .set(authHeader(staffToken));

            expect(response.status).toBe(403);
        });
    });
});
