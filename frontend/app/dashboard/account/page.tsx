"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Building2, MapPin, Phone, Calendar, Upload, Edit2, Save, X, Lock, Loader2 } from "lucide-react"
import { updateProfile, getCurrentUser } from "@/lib/api/user"
import { toast } from "sonner"

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingUser, setIsFetchingUser] = useState(true)

  useEffect(() => {
    // Fetch fresh user data from API
    const fetchUserData = async () => {
      try {
        setIsFetchingUser(true)
        const response = await getCurrentUser()

        if (response.success && response.data?.user) {
          const userData = response.data.user
          setUser(userData)
          setEditedName(userData.name || "")
          // Update localStorage with fresh data
          localStorage.setItem("user", JSON.stringify(userData))
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error)
        // Fallback to localStorage if API fails (but not on 401 as it will redirect)
        if (error.status !== 401) {
          const storedUser = localStorage.getItem("user")
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
            setEditedName(parsedUser.name || "")
          }
        }
      } finally {
        setIsFetchingUser(false)
      }
    }

    fetchUserData()
  }, [])

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error("Name cannot be empty")
      return
    }

    setIsLoading(true)
    try {
      const response = await updateProfile({ name: editedName })

      if (response.success && response.data?.user) {
        const updatedUser = {
          ...response.data.user,
          role: response.data.user.role // Ensure role is preserved as-is from API
        }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
        setIsEditingName(false)
        toast.success("Name updated successfully")
      }
    } catch (error: any) {
      console.error("Error updating name:", error)
      // Only show error if it's not a 401 (401 will auto-redirect)
      if (error.status !== 401) {
        toast.error(error.message || "Failed to update name")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelNameEdit = () => {
    setEditedName(user.name || "")
    setIsEditingName(false)
  }

  const handleSavePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error("Current password is required")
      return
    }

    if (!passwordData.newPassword) {
      toast.error("New password is required")
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      const response = await updateProfile({
        password: passwordData.newPassword,
        currentPassword: passwordData.currentPassword
      })

      if (response.success) {
        toast.success("Password updated successfully. Please log in again.")
        setIsEditingPassword(false)
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })

        // Clear auth data and redirect to login after a delay
        setTimeout(() => {
          localStorage.removeItem("user")
          localStorage.removeItem("devAccessToken")
          document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
          document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
          window.location.href = "/login"
        }, 2000)
      }
    } catch (error: any) {
      console.error("Error updating password:", error)
      // Only show error if it's not a 401 (401 will auto-redirect)
      if (error.status !== 401) {
        toast.error(error.message || "Failed to update password")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelPasswordEdit = () => {
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setIsEditingPassword(false)
  }

  if (isFetchingUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading account information...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt={user.name || user.email} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-lg">{user.name || "User"}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge variant="secondary" className="capitalize">
                  {user.role?.toLowerCase() || "staff"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Personal Information</CardTitle>
                </div>
                {!isEditingName && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              <CardDescription>
                Your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  disabled={!isEditingName || isLoading}
                />
              </div>
              {isEditingName && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelNameEdit}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveName}
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  <CardTitle>Change Password</CardTitle>
                </div>
                {!isEditingPassword && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingPassword(true)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                )}
              </div>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            {isEditingPassword && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    disabled={isLoading}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    disabled={isLoading}
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelPasswordEdit}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSavePassword}
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Commented out for future use */}
          {/* <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <CardTitle>Company Information</CardTitle>
              </div>
              <CardDescription>
                Your company details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  defaultValue={user.company?.name || "Demo Company"}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  defaultValue={user.role || "staff"}
                  className="capitalize"
                  disabled
                />
              </div>
              {user.warehouseId && (
                <div className="space-y-2">
                  <Label>Warehouse</Label>
                  <Input
                    defaultValue="Main Warehouse"
                    disabled
                  />
                </div>
              )}
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <CardTitle>Account Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Account Status</p>
                  <p className="text-xs text-muted-foreground">Your account is {user.emailVerified ? 'verified and active' : 'pending verification'}</p>
                </div>
                <Badge variant={user.emailVerified ? "default" : "secondary"}>
                  {user.emailVerified ? 'Active' : 'Unverified'}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {user.id}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role?.toLowerCase() || "staff"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
