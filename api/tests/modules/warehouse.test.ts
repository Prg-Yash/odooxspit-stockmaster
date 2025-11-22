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

describe('Warehouse API', () => {
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

    describe('POST /warehouses', () => {
        it('should create warehouse as owner', async () => {
            const response = await request(app)
                .post('/warehouses')
                .set(authHeader(ownerToken))
                .send({
                    name: 'New Test Warehouse',
                    code: 'WH-NEW',
                    address: '789 New Street',
                    city: 'Pune',
                    state: 'Maharashtra',
                    country: 'India',
                    postalCode: '411001',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('New Test Warehouse');
            expect(response.body.data.code).toBe('WH-NEW');
        });

        it('should block warehouse creation as manager', async () => {
            const response = await request(app)
                .post('/warehouses')
                .set(authHeader(managerToken))
                .send({
                    name: 'Unauthorized Warehouse',
                    code: 'WH-UNAUTH',
                    address: '999 Unauthorized St',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    country: 'India',
                    postalCode: '400001',
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        it('should block warehouse creation as staff', async () => {
            const response = await request(app)
                .post('/warehouses')
                .set(authHeader(staffToken))
                .send({
                    name: 'Staff Warehouse',
                    code: 'WH-STAFF',
                    address: '888 Staff St',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    country: 'India',
                    postalCode: '400001',
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /warehouses', () => {
        it('should get all warehouses as owner', async () => {
            const response = await request(app)
                .get('/warehouses')
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        });

        it('should get only assigned warehouses as manager', async () => {
            const response = await request(app)
                .get('/warehouses')
                .set(authHeader(managerToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            // Manager should only see warehouses they're members of
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('GET /warehouses/:id', () => {
        it('should get warehouse details as owner', async () => {
            const response = await request(app)
                .get(`/warehouses/${seededData.warehouses.main.id}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(seededData.warehouses.main.id);
            expect(response.body.data.name).toBe(seededData.warehouses.main.name);
        });

        it('should get assigned warehouse details as manager', async () => {
            const response = await request(app)
                .get(`/warehouses/${seededData.warehouses.main.id}`)
                .set(authHeader(managerToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should block access to unassigned warehouse as staff', async () => {
            const response = await request(app)
                .get(`/warehouses/${seededData.warehouses.secondary.id}`)
                .set(authHeader(staffToken));

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /warehouses/:id', () => {
        it('should update warehouse as owner', async () => {
            const response = await request(app)
                .put(`/warehouses/${seededData.warehouses.main.id}`)
                .set(authHeader(ownerToken))
                .send({
                    name: 'Updated Main Warehouse',
                    isActive: true,
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Updated Main Warehouse');
        });

        it('should update warehouse as manager', async () => {
            const response = await request(app)
                .put(`/warehouses/${seededData.warehouses.main.id}`)
                .set(authHeader(managerToken))
                .send({
                    address: 'Updated Address',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should block warehouse update as staff', async () => {
            const response = await request(app)
                .put(`/warehouses/${seededData.warehouses.main.id}`)
                .set(authHeader(staffToken))
                .send({
                    name: 'Staff Updated Name',
                });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });
    });

    describe('Warehouse Members', () => {
        describe('GET /warehouses/:id/members', () => {
            it('should get warehouse members', async () => {
                const response = await request(app)
                    .get(`/warehouses/${seededData.warehouses.main.id}/members`)
                    .set(authHeader(ownerToken));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data)).toBe(true);
                expect(response.body.data.length).toBeGreaterThanOrEqual(2);
            });
        });

        describe('POST /warehouses/:id/members', () => {
            it('should add member as manager', async () => {
                // Create a new user first
                const newUserResponse = await request(app)
                    .post('/auth/register')
                    .send({
                        email: 'newmember@test.com',
                        password: 'NewMember@123',
                        name: 'New Member',
                        role: 'staff',
                    });

                const newUserId = newUserResponse.body.data.user.id;

                const response = await request(app)
                    .post(`/warehouses/${seededData.warehouses.main.id}/members`)
                    .set(authHeader(managerToken))
                    .send({
                        userId: newUserId,
                        role: 'STAFF',
                    });

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
            });

            it('should block adding member as staff', async () => {
                const response = await request(app)
                    .post(`/warehouses/${seededData.warehouses.main.id}/members`)
                    .set(authHeader(staffToken))
                    .send({
                        userId: 'some-user-id',
                        role: 'STAFF',
                    });

                expect(response.status).toBe(403);
                expect(response.body.success).toBe(false);
            });
        });
    });

    describe('Warehouse Locations', () => {
        describe('GET /warehouses/:id/locations', () => {
            it('should get warehouse locations', async () => {
                const response = await request(app)
                    .get(`/warehouses/${seededData.warehouses.main.id}/locations`)
                    .set(authHeader(ownerToken));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data)).toBe(true);
            });
        });

        describe('POST /warehouses/:id/locations', () => {
            it('should create location as manager', async () => {
                const response = await request(app)
                    .post(`/warehouses/${seededData.warehouses.main.id}/locations`)
                    .set(authHeader(managerToken))
                    .send({
                        name: 'New Location',
                        aisle: 'C',
                        rack: '3',
                        shelf: '3',
                        bin: 'C',
                    });

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(response.body.data.name).toBe('New Location');
            });

            it('should block location creation as staff', async () => {
                const response = await request(app)
                    .post(`/warehouses/${seededData.warehouses.main.id}/locations`)
                    .set(authHeader(staffToken))
                    .send({
                        name: 'Staff Location',
                        aisle: 'D',
                        rack: '4',
                        shelf: '4',
                        bin: 'D',
                    });

                expect(response.status).toBe(403);
                expect(response.body.success).toBe(false);
            });
        });
    });

    describe('DELETE /warehouses/:id', () => {
        it('should delete warehouse as owner', async () => {
            // Create a warehouse to delete
            const createResponse = await request(app)
                .post('/warehouses')
                .set(authHeader(ownerToken))
                .send({
                    name: 'Warehouse to Delete',
                    code: 'WH-DEL',
                    address: '123 Delete St',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    country: 'India',
                    postalCode: '400001',
                });

            const warehouseId = createResponse.body.data.id;

            const response = await request(app)
                .delete(`/warehouses/${warehouseId}`)
                .set(authHeader(ownerToken));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('should block warehouse deletion as staff', async () => {
            const response = await request(app)
                .delete(`/warehouses/${seededData.warehouses.main.id}`)
                .set(authHeader(staffToken));

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });
    });
});
