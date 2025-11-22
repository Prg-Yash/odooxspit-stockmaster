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

describe('Product API', () => {
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

    describe('Category Management', () => {
        describe('POST /products/categories', () => {
            it('should create category as owner', async () => {
                const response = await request(app)
                    .post('/products/categories')
                    .set(authHeader(ownerToken))
                    .send({
                        name: 'New Category',
                        description: 'New category description',
                    });

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(response.body.data.name).toBe('New Category');
            });

            it('should create category as manager', async () => {
                const response = await request(app)
                    .post('/products/categories')
                    .set(authHeader(managerToken))
                    .send({
                        name: 'Manager Category',
                        description: 'Manager category',
                    });

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
            });
        });

        describe('GET /products/categories', () => {
            it('should get all categories', async () => {
                const response = await request(app)
                    .get('/products/categories')
                    .set(authHeader(ownerToken));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data)).toBe(true);
                expect(response.body.data.length).toBeGreaterThanOrEqual(2);
            });
        });

        describe('GET /products/categories/:id', () => {
            it('should get category by id', async () => {
                const response = await request(app)
                    .get(`/products/categories/${seededData.categories.electronics.id}`)
                    .set(authHeader(ownerToken));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.id).toBe(seededData.categories.electronics.id);
            });
        });

        describe('PUT /products/categories/:id', () => {
            it('should update category', async () => {
                const response = await request(app)
                    .put(`/products/categories/${seededData.categories.furniture.id}`)
                    .set(authHeader(ownerToken))
                    .send({
                        name: 'Updated Furniture',
                        description: 'Updated description',
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.name).toBe('Updated Furniture');
            });
        });
    });

    describe('Product Management', () => {
        describe('POST /products/warehouse/:warehouseId', () => {
            it('should create product as owner', async () => {
                const response = await request(app)
                    .post(`/products/warehouse/${seededData.warehouses.main.id}`)
                    .set(authHeader(ownerToken))
                    .send({
                        sku: 'NEWPROD-001',
                        name: 'New Test Product',
                        description: 'New product description',
                        categoryId: seededData.categories.electronics.id,
                        unitOfMeasure: 'PIECE',
                        unitPrice: 1000,
                        reorderLevel: 5,
                    });

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(response.body.data.sku).toBe('NEWPROD-001');
                expect(response.body.data.name).toBe('New Test Product');
            });

            it('should create product as manager', async () => {
                const response = await request(app)
                    .post(`/products/warehouse/${seededData.warehouses.main.id}`)
                    .set(authHeader(managerToken))
                    .send({
                        sku: 'MGR-PROD-001',
                        name: 'Manager Product',
                        description: 'Manager product',
                        categoryId: seededData.categories.electronics.id,
                        unitOfMeasure: 'PIECE',
                        unitPrice: 2000,
                        reorderLevel: 3,
                    });

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
            });

            it('should block product creation as staff', async () => {
                const response = await request(app)
                    .post(`/products/warehouse/${seededData.warehouses.main.id}`)
                    .set(authHeader(staffToken))
                    .send({
                        sku: 'STAFF-PROD-001',
                        name: 'Staff Product',
                        unitOfMeasure: 'PIECE',
                        unitPrice: 500,
                    });

                expect(response.status).toBe(403);
            });

            it('should reject duplicate SKU', async () => {
                const response = await request(app)
                    .post(`/products/warehouse/${seededData.warehouses.main.id}`)
                    .set(authHeader(ownerToken))
                    .send({
                        sku: seededData.products.laptop.sku,
                        name: 'Duplicate SKU Product',
                        unitOfMeasure: 'PIECE',
                        unitPrice: 1000,
                    });

                expect(response.status).toBe(409);
            });
        });

        describe('GET /products/warehouse/:warehouseId', () => {
            it('should get all products in warehouse', async () => {
                const response = await request(app)
                    .get(`/products/warehouse/${seededData.warehouses.main.id}`)
                    .set(authHeader(ownerToken));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data)).toBe(true);
                expect(response.body.data.length).toBeGreaterThanOrEqual(2);
            });

            it('should search products by name', async () => {
                const response = await request(app)
                    .get(`/products/warehouse/${seededData.warehouses.main.id}?search=laptop`)
                    .set(authHeader(ownerToken));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            });

            it('should filter products by category', async () => {
                const response = await request(app)
                    .get(`/products/warehouse/${seededData.warehouses.main.id}?categoryId=${seededData.categories.electronics.id}`)
                    .set(authHeader(ownerToken));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                response.body.data.forEach((product: any) => {
                    expect(product.categoryId).toBe(seededData.categories.electronics.id);
                });
            });
        });

        describe('GET /products/:id', () => {
            it('should get product by id', async () => {
                const response = await request(app)
                    .get(`/products/${seededData.products.laptop.id}`)
                    .set(authHeader(ownerToken));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.id).toBe(seededData.products.laptop.id);
            });
        });

        describe('GET /products/:id/stock-summary', () => {
            it('should get product stock summary', async () => {
                const response = await request(app)
                    .get(`/products/${seededData.products.laptop.id}/stock-summary`)
                    .set(authHeader(ownerToken));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data).toHaveProperty('totalStock');
                expect(response.body.data).toHaveProperty('locations');
            });
        });

        describe('PUT /products/:id', () => {
            it('should update product as owner', async () => {
                const response = await request(app)
                    .put(`/products/${seededData.products.mouse.id}`)
                    .set(authHeader(ownerToken))
                    .send({
                        name: 'Updated Mouse Name',
                        unitPrice: 600,
                        reorderLevel: 15,
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.name).toBe('Updated Mouse Name');
                expect(response.body.data.unitPrice).toBe(600);
            });

            it('should update product as manager', async () => {
                const response = await request(app)
                    .put(`/products/${seededData.products.laptop.id}`)
                    .set(authHeader(managerToken))
                    .send({
                        description: 'Updated by manager',
                    });

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
            });

            it('should block product update as staff', async () => {
                const response = await request(app)
                    .put(`/products/${seededData.products.laptop.id}`)
                    .set(authHeader(staffToken))
                    .send({
                        name: 'Staff Update',
                    });

                expect(response.status).toBe(403);
            });
        });

        describe('DELETE /products/:id', () => {
            it('should soft delete product as owner', async () => {
                const response = await request(app)
                    .delete(`/products/${seededData.products.mouse.id}`)
                    .set(authHeader(ownerToken));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                // Verify soft delete - product should exist but be inactive
                const getResponse = await request(app)
                    .get(`/products/${seededData.products.mouse.id}`)
                    .set(authHeader(ownerToken));

                expect(getResponse.body.data.isActive).toBe(false);
            });
        });

        describe('GET /products/warehouse/:warehouseId/low-stock', () => {
            it('should get low stock products', async () => {
                const response = await request(app)
                    .get(`/products/warehouse/${seededData.warehouses.main.id}/low-stock`)
                    .set(authHeader(ownerToken));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(Array.isArray(response.body.data)).toBe(true);
            });
        });
    });
});
