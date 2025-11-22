"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Users, Warehouse as WarehouseIcon, ArrowRight, CheckCircle2 } from "lucide-react"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
  // Mock onboarding, no auth, no router
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [warehouseData, setWarehouseData] = useState({
    name: "",
    location: "",
    capacity: "",
  })
  const [managerData, setManagerData] = useState({
    name: "",
    email: "",
  })



  const handleCreateWarehouse = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep(2)
    }, 800)
  }

  const handleInviteManager = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setStep(3)
    }, 800)
  }

  const handleComplete = () => {
    setStep(1)
    setWarehouseData({ name: "", location: "", capacity: "" })
    setManagerData({ name: "", email: "" })
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-secondary p-4">
      <div className="max-w-4xl mx-auto pt-12 pb-24">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : "1"}
              </div>
              <div className="text-sm font-medium">Create Warehouse</div>
            </div>
            <div className="h-px flex-1 mx-4 bg-muted" />
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > 2 ? <CheckCircle2 className="h-5 w-5" /> : "2"}
              </div>
              <div className="text-sm font-medium">Invite Manager</div>
            </div>
            <div className="h-px flex-1 mx-4 bg-muted" />
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > 3 ? <CheckCircle2 className="h-5 w-5" /> : "3"}
              </div>
              <div className="text-sm font-medium">All Set</div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <WarehouseIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Create Your First Warehouse</CardTitle>
                  <CardDescription>
                    Set up a warehouse to start managing your inventory
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="warehouseName">Warehouse Name</Label>
                <Input
                  id="warehouseName"
                  placeholder="Main Warehouse"
                  value={warehouseData.name}
                  onChange={(e) => setWarehouseData({ ...warehouseData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="123 Storage Ave, City, Country"
                  value={warehouseData.location}
                  onChange={(e) => setWarehouseData({ ...warehouseData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (units)</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="10000"
                  value={warehouseData.capacity}
                  onChange={(e) => setWarehouseData({ ...warehouseData, capacity: e.target.value })}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreateWarehouse}
                disabled={!warehouseData.name || !warehouseData.location || !warehouseData.capacity || isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Warehouse
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Invite a Warehouse Manager</CardTitle>
                  <CardDescription>
                    Add a manager to oversee operations and manage employees
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="managerName">Manager Name</Label>
                <Input
                  id="managerName"
                  placeholder="Jane Smith"
                  value={managerData.name}
                  onChange={(e) => setManagerData({ ...managerData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerEmail">Manager Email</Label>
                <Input
                  id="managerEmail"
                  type="email"
                  placeholder="jane@example.com"
                  value={managerData.email}
                  onChange={(e) => setManagerData({ ...managerData, email: e.target.value })}
                />
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  An invitation email will be sent to this address. The manager can set their password upon first login.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleInviteManager}
                  disabled={!managerData.name || !managerData.email || isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Invitation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>You&apos;re All Set!</CardTitle>
                  <CardDescription>
                    Your account is ready. Start managing your inventory.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Company Created</div>
                    <div className="text-sm text-muted-foreground">Demo Company</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <WarehouseIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Warehouse Created</div>
                    <div className="text-sm text-muted-foreground">{warehouseData.name || "Main Warehouse"}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Manager Invited</div>
                    <div className="text-sm text-muted-foreground">{managerData.email || "manager@example.com"}</div>
                  </div>
                </div>
              </div>
              <Button className="w-full" onClick={handleComplete}>
                Restart Onboarding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
