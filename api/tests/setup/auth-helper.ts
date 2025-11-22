import request from 'supertest';
import { createTestApp } from './test-app';

export interface TestTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthenticatedUser {
    email: string;
    password: string;
    tokens: TestTokens;
}

// Shared test app instance
let testApp: ReturnType<typeof createTestApp> | null = null;

/**
 * Get or create the test app instance
 */
export function getTestApp() {
    if (!testApp) {
        testApp = createTestApp();
    }
    return testApp;
}

/**
 * Login and get authentication tokens
 */
export async function loginUser(
    email: string,
    password: string
): Promise<TestTokens> {
    const app = getTestApp();
    const response = await request(app)
        .post('/auth/login')
        .send({ email, password })
        .expect(200);

    return {
        accessToken: response.body.data.accessToken,
        refreshToken: response.body.data.refreshToken,
    };
}

/**
 * Get authenticated owner user tokens
 */
export async function getOwnerTokens(): Promise<TestTokens> {
    return loginUser('owner@test.com', 'Owner@123');
}

/**
 * Get authenticated manager user tokens
 */
export async function getManagerTokens(): Promise<TestTokens> {
    return loginUser('manager@test.com', 'Manager@123');
}

/**
 * Get authenticated staff user tokens
 */
export async function getStaffTokens(): Promise<TestTokens> {
    return loginUser('staff@test.com', 'Staff@123');
}

/**
 * Create authorization header with Bearer token
 */
export function authHeader(token: string): { Authorization: string } {
    return { Authorization: `Bearer ${token}` };
}

/**
 * Register a new test user
 */
export async function registerUser(
    userData: {
        email: string;
        password: string;
        name: string;
        role: 'owner' | 'manager' | 'staff';
    }
) {
    const app = getTestApp();
    const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

    return response.body.data.user;
}

/**
 * Logout user by revoking refresh token
 */
export async function logoutUser(
    refreshToken: string
): Promise<void> {
    const app = getTestApp();
    await request(app)
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(200);
}
