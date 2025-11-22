"use client";

import { useEffect, useState } from "react";

export default function AuthDebugPage() {
    const [cookies, setCookies] = useState<string>("");
    const [localStorage, setLocalStorage] = useState<Record<string, string>>({});
    const [apiTest, setApiTest] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        // Check cookies
        setCookies(document.cookie);

        // Check localStorage
        const storage: Record<string, string> = {};
        for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key) {
                storage[key] = window.localStorage.getItem(key) || "";
            }
        }
        setLocalStorage(storage);

        // Test API call
        testApiCall();
    }, []);

    async function testApiCall() {
        try {
            const response = await fetch("http://localhost:4000/warehouses", {
                credentials: "include",
            });

            if (response.ok) {
                setApiTest({ success: true, message: "API call successful!" });
            } else {
                const data = await response.json();
                setApiTest({ success: false, message: `API call failed: ${response.status} - ${data.message}` });
            }
        } catch (error) {
            setApiTest({ success: false, message: `Network error: ${error}` });
        }
    }

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>

            <div className="space-y-6">
                {/* Cookies */}
                <div className="p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Cookies</h2>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono break-all">
                        {cookies || "No cookies found"}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        Looking for: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">accessToken</code>
                    </div>
                </div>

                {/* LocalStorage */}
                <div className="p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">LocalStorage</h2>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                        {Object.keys(localStorage).length > 0 ? (
                            <pre>{JSON.stringify(localStorage, null, 2)}</pre>
                        ) : (
                            "No localStorage items found"
                        )}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        Looking for: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">devAccessToken</code> or{" "}
                        <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">user</code>
                    </div>
                </div>

                {/* API Test */}
                <div className="p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">API Test Result</h2>
                    <div className={`p-3 rounded text-sm ${apiTest?.success ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}>
                        {apiTest ? apiTest.message : "Testing..."}
                    </div>
                </div>

                {/* Instructions */}
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                    <h2 className="text-xl font-semibold mb-2">Instructions</h2>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>If you see <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">accessToken</code> in cookies, authentication is working via cookies</li>
                        <li>If you see <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">devAccessToken</code> in localStorage, you're using dev login</li>
                        <li>If API test succeeds, authentication is properly configured</li>
                        <li>If API test fails with 401, authentication tokens are not being sent</li>
                    </ol>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.href = "/login"}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Go to Login
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Refresh Page
                    </button>
                    <button
                        onClick={() => {
                            document.cookie.split(";").forEach(c => {
                                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                            });
                            window.localStorage.clear();
                            window.location.reload();
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Clear All & Reload
                    </button>
                </div>
            </div>
        </div>
    );
}
