"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Warehouse as WarehouseIcon, ArrowRight, CheckCircle2, Package, Boxes, MapPin, Mail, User } from "lucide-react"
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
    <div className="min-h-screen bg-linear-to-br from-background via-secondary/20 to-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto pt-8 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to StockMaster 🎉</h1>
          <p className="text-muted-foreground">Let&apos;s get your inventory system up and running</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-2">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                step >= 1 ? "bg-primary text-primary-foreground shadow-lg scale-110" : "bg-muted text-muted-foreground"
              }`}>
                {step > 1 ? <CheckCircle2 className="h-6 w-6" /> : <WarehouseIcon className="h-5 w-5" />}
              </div>
              <div className="text-xs md:text-sm font-medium text-center">Warehouse</div>
            </div>
            <div className={`h-1 flex-1 mx-3 rounded-full transition-all ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div className="flex flex-col items-center gap-2">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                step >= 2 ? "bg-primary text-primary-foreground shadow-lg scale-110" : "bg-muted text-muted-foreground"
              }`}>
                {step > 2 ? <CheckCircle2 className="h-6 w-6" /> : <Users className="h-5 w-5" />}
              </div>
              <div className="text-xs md:text-sm font-medium text-center">Team</div>
            </div>
            <div className={`h-1 flex-1 mx-3 rounded-full transition-all ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
            <div className="flex flex-col items-center gap-2">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                step >= 3 ? "bg-primary text-primary-foreground shadow-lg scale-110" : "bg-muted text-muted-foreground"
              }`}>
                {step >= 3 ? <CheckCircle2 className="h-6 w-6" /> : <Package className="h-5 w-5" />}
              </div>
              <div className="text-xs md:text-sm font-medium text-center">Ready</div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <Card className="shadow-xl border-2 animate-fade-in">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <WarehouseIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Create Your First Warehouse</CardTitle>
                    <CardDescription className="text-base">
                      Set up a warehouse to start managing your inventory
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="ml-auto">Step 1 of 3</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="warehouseName" className="flex items-center gap-2">
                    <Boxes className="h-4 w-4 text-primary" />
                    Warehouse Name
                  </Label>
                  <Input
                    id="warehouseName"
                    placeholder="Main Warehouse"
                    value={warehouseData.name}
                    onChange={(e) => setWarehouseData({ ...warehouseData, name: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity" className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Capacity (units)
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="10000"
                    value={warehouseData.capacity}
                    onChange={(e) => setWarehouseData({ ...warehouseData, capacity: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="123 Storage Ave, City, Country"
                  value={warehouseData.location}
                  onChange={(e) => setWarehouseData({ ...warehouseData, location: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  <span>Your warehouse will be the central hub for managing all inventory operations, tracking stock levels, and coordinating shipments.</span>
                </p>
              </div>
              <Button
                className="w-full h-12 text-base"
                size="lg"
                onClick={handleCreateWarehouse}
                disabled={!warehouseData.name || !warehouseData.location || !warehouseData.capacity || isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Create Warehouse & Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-xl border-2 animate-fade-in">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Invite a Warehouse Manager</CardTitle>
                    <CardDescription className="text-base">
                      Add a manager to oversee operations and manage employees
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="ml-auto">Step 2 of 3</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="managerName" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Manager Name
                  </Label>
                  <Input
                    id="managerName"
                    placeholder="Jane Smith"
                    value={managerData.name}
                    onChange={(e) => setManagerData({ ...managerData, name: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerEmail" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Manager Email
                  </Label>
                  <Input
                    id="managerEmail"
                    type="email"
                    placeholder="jane@example.com"
                    value={managerData.email}
                    onChange={(e) => setManagerData({ ...managerData, email: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <Mail className="h-4 w-4 text-primary mt-0.5" />
                  <span>An invitation email will be sent to this address. The manager can set their password upon first login and will have full access to warehouse operations.</span>
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-12"
                  size="lg"
                >
                  <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
                  Back
                </Button>
                <Button
                  className="flex-1 h-12 text-base"
                  size="lg"
                  onClick={handleInviteManager}
                  disabled={!managerData.name || !managerData.email || isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Send Invitation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="shadow-xl border-2 animate-fade-in">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">You&apos;re All Set! 🎉</CardTitle>
                    <CardDescription className="text-base">
                      Your account is ready. Start managing your inventory.
                    </CardDescription>
                  </div>
                </div>
                <Badge className="ml-auto bg-green-500">Complete</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <Card className="border-2 border-primary/20 bg-primary/5 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-1">Company Created</div>
                        <div className="text-sm text-muted-foreground">Demo Company</div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-primary/20 bg-primary/5 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <WarehouseIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-1">Warehouse Created</div>
                        <div className="text-sm text-muted-foreground">{warehouseData.name || "Main Warehouse"}</div>
                        <div className="text-xs text-muted-foreground mt-1">{warehouseData.location || "Location not set"}</div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-primary/20 bg-primary/5 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-1">Manager Invited</div>
                        <div className="text-sm text-muted-foreground">{managerData.email || "manager@example.com"}</div>
                        <div className="text-xs text-muted-foreground mt-1">{managerData.name || "Manager"}</div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  🚀 Your inventory management system is ready to use. You can now start adding products, managing stock, and tracking warehouse operations.
                </p>
              </div>
              <Button className="w-full h-12 text-base" size="lg" onClick={handleComplete}>
                <Package className="mr-2 h-5 w-5" />
                Restart Onboarding
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
