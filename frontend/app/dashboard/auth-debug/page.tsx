"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, LogOut, AlertCircle, CheckCircle2 } from "lucide-react"
import { api } from "@/lib/api-client"
import { refreshUserData, clearAuthData } from "@/lib/auth-utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AuthDebugPage() {
    const router = useRouter()
    const [localStorageUser, setLocalStorageUser] = useState<any>(null)
    const [apiUser, setApiUser] = useState<any>(null)
    const [token, setToken] = useState<string | null>(null)
    const [cookieToken, setCookieToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadAuthData()
    }, [])

    const loadAuthData = () => {
        // Get from localStorage
        const userStr = localStorage.getItem("user")
        if (userStr) {
            try {
                setLocalStorageUser(JSON.parse(userStr))
            } catch {
                setLocalStorageUser("Invalid JSON")
            }
        }

        // Get token
        const localToken = localStorage.getItem("devAccessToken")
        setToken(localToken)

        // Check cookie
        const cookies = document.cookie.split(';')
        const accessTokenCookie = cookies.find(c => c.trim().startsWith('accessToken='))
        if (accessTokenCookie) {
            setCookieToken(accessTokenCookie.split('=')[1])
        }
    }

    const fetchApiUser = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await api.get<any>("/user/me")
            setApiUser(response.data?.user || response.user || response)
            toast.success("Fetched user from API")
        } catch (err: any) {
            setError(err.message)
            toast.error("Failed to fetch user from API")
        } finally {
            setIsLoading(false)
        }
    }

    const handleRefresh = async () => {
        try {
            setIsLoading(true)
            const freshUser = await refreshUserData()
            setLocalStorageUser(freshUser)
            await fetchApiUser()
            toast.success("Session refreshed!")
            loadAuthData()
        } catch (err) {
            toast.error("Failed to refresh session")
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = () => {
        clearAuthData()
        toast.success("Logged out successfully")
        router.push("/login")
    }

    const rolesMatch = localStorageUser?.role === apiUser?.role

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Authentication Debug</h1>
                <p className="text-muted-foreground">Check your authentication state and tokens</p>
            </div>

            <div className="flex gap-2">
                <Button onClick={fetchApiUser} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Fetch API User
                </Button>
                <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Session
                </Button>
                <Button onClick={handleLogout} variant="destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout & Clear
                </Button>
            </div>

            {error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <p className="font-semibold">Error: {error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>localStorage User Data</CardTitle>
                    <CardDescription>Data stored in your browser</CardDescription>
                </CardHeader>
                <CardContent>
                    {localStorageUser ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Name:</span>
                                <span>{localStorageUser.name || "N/A"}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Email:</span>
                                <span>{localStorageUser.email}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Role:</span>
                                <Badge variant="secondary" className="capitalize">
                                    {localStorageUser.role?.toLowerCase()}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Email Verified:</span>
                                <Badge variant={localStorageUser.emailVerified ? "default" : "secondary"}>
                                    {localStorageUser.emailVerified ? "Yes" : "No"}
                                </Badge>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No user data in localStorage</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>API User Data</CardTitle>
                    <CardDescription>Fresh data from the backend</CardDescription>
                </CardHeader>
                <CardContent>
                    {apiUser ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Name:</span>
                                <span>{apiUser.name || "N/A"}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Email:</span>
                                <span>{apiUser.email}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Role:</span>
                                <Badge variant="secondary" className="capitalize">
                                    {apiUser.role?.toLowerCase()}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Email Verified:</span>
                                <Badge variant={apiUser.emailVerified ? "default" : "secondary"}>
                                    {apiUser.emailVerified ? "Yes" : "No"}
                                </Badge>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Click "Fetch API User" to load</p>
                    )}
                </CardContent>
            </Card>

            {localStorageUser && apiUser && (
                <Card className={rolesMatch ? "border-green-500" : "border-destructive"}>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            {rolesMatch ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <p className="font-semibold text-green-500">Roles Match! ✅</p>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                    <p className="font-semibold text-destructive">
                                        Roles Don't Match! localStorage: {localStorageUser.role} vs API: {apiUser.role}
                                    </p>
                                </>
                            )}
                        </div>
                        {!rolesMatch && (
                            <p className="text-sm text-muted-foreground mt-2">
                                Click "Refresh Session" to sync your localStorage with the API
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Tokens</CardTitle>
                    <CardDescription>Authentication tokens</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="font-semibold mb-2">localStorage Token:</p>
                        {token ? (
                            <code className="block p-2 bg-secondary rounded text-xs break-all">
                                {token.substring(0, 50)}...
                            </code>
                        ) : (
                            <p className="text-muted-foreground">No token in localStorage</p>
                        )}
                    </div>
                    <Separator />
                    <div>
                        <p className="font-semibold mb-2">Cookie Token:</p>
                        {cookieToken ? (
                            <code className="block p-2 bg-secondary rounded text-xs break-all">
                                {cookieToken.substring(0, 50)}...
                            </code>
                        ) : (
                            <p className="text-muted-foreground">No token in cookies</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-950">
                <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">💡 Troubleshooting Tips:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>If roles don't match, click "Refresh Session"</li>
                        <li>If you still get 403 errors, click "Logout & Clear" then login again</li>
                        <li>The backend always uses the role from the database (API role)</li>
                        <li>localStorage is just a cache - it can be out of sync</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
