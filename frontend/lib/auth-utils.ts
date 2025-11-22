/**
 * Authentication utilities
 * Helper functions for managing authentication state
 */

import { api } from "./api-client";

/**
 * Refresh user data from API and update localStorage
 * Call this after login or when you suspect localStorage has stale data
 */
export async function refreshUserData() {
    try {
        const response = await api.get<{
            success: boolean;
            data: {
                user: {
                    id: string;
                    email: string;
                    name: string | null;
                    role: string;
                    emailVerified: boolean;
                    createdAt: string;
                    updatedAt: string;
                };
            };
        }>("/user/me");

        if (response.success && response.data?.user) {
            const userData = response.data.user;
            localStorage.setItem("user", JSON.stringify(userData));
            console.log("✅ User data refreshed:", userData);
            return userData;
        }
    } catch (error) {
        console.error("❌ Failed to refresh user data:", error);
        throw error;
    }
}

/**
 * Clear all authentication data
 */
export function clearAuthData() {
    localStorage.removeItem("user");
    localStorage.removeItem("devAccessToken");
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

/**
 * Get current user from localStorage
 */
export function getCurrentUserFromStorage() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}
