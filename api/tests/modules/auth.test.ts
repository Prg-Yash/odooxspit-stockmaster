import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { setupTestDatabase, teardownTestDatabase } from '../setup/test-db';
import { seedTestDatabase, type SeededData } from '../setup/seed';
import { getTestApp, authHeader, registerUser } from '../setup/auth-helper';

let seededData: SeededData;
let app: ReturnType<typeof getTestApp>;

describe('Auth API', () => {
    beforeAll(async () => {
        app = getTestApp();
        await setupTestDatabase();
        seededData = await seedTestDatabase();
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    describe('POST /auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: 'newuser@test.com',
                    password: 'NewUser@123',
                    name: 'New Test User',
                    role: 'staff',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe('newuser@test.com');
            expect(response.body.data.user.name).toBe('New Test User');
            expect(response.body.data.user.role).toBe('STAFF');
        });

        it('should reject registration with existing email', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: seededData.users.owner.email,
                    password: 'Test@123',
                    name: 'Duplicate User',
                    role: 'staff',
                });

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
        });

        it('should reject weak password', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: 'weakpass@test.com',
                    password: 'weak',
                    name: 'Weak Password User',
                    role: 'staff',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should reject invalid email format', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'Valid@123',
                    name: 'Invalid Email User',
                    role: 'staff',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: seededData.users.owner.email,
                    password: seededData.users.owner.password,
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
            expect(response.body.data.user.email).toBe(seededData.users.owner.email);
        });

        it('should reject login with invalid password', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: seededData.users.owner.email,
                    password: 'WrongPassword@123',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should reject login with non-existent email', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'Test@123',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /auth/refresh-token', () => {
        it('should refresh access token with valid refresh token', async () => {
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: seededData.users.manager.email,
                    password: seededData.users.manager.password,
                });

            const { refreshToken } = loginResponse.body.data;

            const response = await request(app)
                .post('/auth/refresh-token')
                .send({ refreshToken });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
        });

        it('should reject invalid refresh token', async () => {
            const response = await request(app)
                .post('/auth/refresh-token')
                .send({ refreshToken: 'invalid-token' });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout successfully', async () => {
            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: seededData.users.staff.email,
                    password: seededData.users.staff.password,
                });

            const { refreshToken } = loginResponse.body.data;

            const response = await request(app)
                .post('/auth/logout')
                .send({ refreshToken });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('POST /auth/resend-verification-email', () => {
        it.skip('should send verification email for unverified user', async () => {
            // Create unverified user
            await registerUser({
                email: 'unverified@test.com',
                password: 'Unverified@123',
                name: 'Unverified User',
                role: 'staff',
            });

            const response = await request(app)
                .post('/auth/resend-verification-email')
                .send({ email: 'unverified@test.com' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
