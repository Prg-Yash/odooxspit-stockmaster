"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Warehouse as WarehouseIcon,
  ArrowRight,
  CheckCircle2,
  Package,
  Boxes,
  MapPin,
  Mail,
  User,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createWarehouse, addWarehouseMember } from "@/lib/api/warehouse";
import { APIError } from "@/lib/api-client";
import { DevLogin } from "@/components/dev-login";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [createdWarehouseId, setCreatedWarehouseId] = useState<string | null>(
    null
  );

  const [warehouseData, setWarehouseData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });

  const [managerData, setManagerData] = useState({
    email: "",
  });

  const handleCreateWarehouse = async () => {
    setIsLoading(true);
    try {
      // Validate required fields
      if (!warehouseData.name || !warehouseData.code) {
        toast({
          title: "Validation Error",
          description: "Warehouse name and code are required",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create warehouse via API
      const response = await createWarehouse({
        name: warehouseData.name,
        code: warehouseData.code,
        address: warehouseData.address || undefined,
        city: warehouseData.city || undefined,
        state: warehouseData.state || undefined,
        country: warehouseData.country || undefined,
        postalCode: warehouseData.postalCode || undefined,
      });

      // Save warehouse ID for adding members
      setCreatedWarehouseId(response.data.warehouse.id);

      toast({
        title: "Success!",
        description: `Warehouse "${response.data.warehouse.name}" created successfully`,
      });

      setStep(2);
    } catch (error) {
      console.error("Create warehouse error:", error);

      if (error instanceof APIError) {
        toast({
          title: "Failed to create warehouse",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteManager = async () => {
    if (!createdWarehouseId) {
      toast({
        title: "Error",
        description: "No warehouse found. Please create a warehouse first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Validate email
      if (!managerData.email) {
        toast({
          title: "Validation Error",
          description: "Manager email is required",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // For demo: Using the second user in database (yashnimse92@gmail.com)
      // In production, you'd have a user search/invite system
      const managerId = "cmi9vntih0000acv5ig1zvom2"; // yashnimse92@gmail.com

      // Add manager to warehouse
      await addWarehouseMember(createdWarehouseId, {
        userId: managerId,
        role: "MANAGER",
      });

      toast({
        title: "Success!",
        description: `Manager invited successfully`,
      });

      setStep(3);
    } catch (error) {
      console.error("Add manager error:", error);

      if (error instanceof APIError) {
        toast({
          title: "Failed to add manager",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    toast({
      title: "Onboarding Complete!",
      description: "Redirecting to dashboard...",
    });

    // Navigate to dashboard
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-secondary/20 to-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto pt-8 pb-24">
        {/* Dev Login - Remove when auth is ready */}
        <div className="max-w-md mx-auto mb-6">
          <DevLogin />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome to StockMaster 🎉
          </h1>
          <p className="text-muted-foreground">
            Let&apos;s get your inventory system up and running
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                  step >= 1
                    ? "bg-primary text-primary-foreground shadow-lg scale-110"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > 1 ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <WarehouseIcon className="h-5 w-5" />
                )}
              </div>
              <div className="text-xs md:text-sm font-medium text-center">
                Warehouse
              </div>
            </div>
            <div
              className={`h-1 flex-1 mx-3 rounded-full transition-all ${
                step >= 2 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                  step >= 2
                    ? "bg-primary text-primary-foreground shadow-lg scale-110"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > 2 ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Users className="h-5 w-5" />
                )}
              </div>
              <div className="text-xs md:text-sm font-medium text-center">
                Team
              </div>
            </div>
            <div
              className={`h-1 flex-1 mx-3 rounded-full transition-all ${
                step >= 3 ? "bg-primary" : "bg-muted"
              }`}
            />
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                  step >= 3
                    ? "bg-primary text-primary-foreground shadow-lg scale-110"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step >= 3 ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Package className="h-5 w-5" />
                )}
              </div>
              <div className="text-xs md:text-sm font-medium text-center">
                Ready
              </div>
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
                    <CardTitle className="text-2xl">
                      Create Your First Warehouse
                    </CardTitle>
                    <CardDescription className="text-base">
                      Set up a warehouse to start managing your inventory
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="ml-auto">
                  Step 1 of 3
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="warehouseName"
                    className="flex items-center gap-2"
                  >
                    <Boxes className="h-4 w-4 text-primary" />
                    Warehouse Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="warehouseName"
                    placeholder="Main Warehouse"
                    value={warehouseData.name}
                    onChange={(e) =>
                      setWarehouseData({
                        ...warehouseData,
                        name: e.target.value,
                      })
                    }
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="warehouseCode"
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4 text-primary" />
                    Warehouse Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="warehouseCode"
                    placeholder="WH-001"
                    value={warehouseData.code}
                    onChange={(e) =>
                      setWarehouseData({
                        ...warehouseData,
                        code: e.target.value,
                      })
                    }
                    className="h-11"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Address
                </Label>
                <Input
                  id="address"
                  placeholder="123 Industrial Avenue"
                  value={warehouseData.address}
                  onChange={(e) =>
                    setWarehouseData({
                      ...warehouseData,
                      address: e.target.value,
                    })
                  }
                  className="h-11"
                />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    value={warehouseData.city}
                    onChange={(e) =>
                      setWarehouseData({
                        ...warehouseData,
                        city: e.target.value,
                      })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="Maharashtra"
                    value={warehouseData.state}
                    onChange={(e) =>
                      setWarehouseData({
                        ...warehouseData,
                        state: e.target.value,
                      })
                    }
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="India"
                    value={warehouseData.country}
                    onChange={(e) =>
                      setWarehouseData({
                        ...warehouseData,
                        country: e.target.value,
                      })
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="400001"
                    value={warehouseData.postalCode}
                    onChange={(e) =>
                      setWarehouseData({
                        ...warehouseData,
                        postalCode: e.target.value,
                      })
                    }
                    className="h-11"
                  />
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                  <span>
                    Your warehouse will be the central hub for managing all
                    inventory operations, tracking stock levels, and
                    coordinating shipments.
                  </span>
                </p>
              </div>
              <Button
                className="w-full h-12 text-base"
                size="lg"
                onClick={handleCreateWarehouse}
                disabled={
                  !warehouseData.name || !warehouseData.code || isLoading
                }
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
                    <CardTitle className="text-2xl">
                      Invite a Warehouse Manager
                    </CardTitle>
                    <CardDescription className="text-base">
                      Add a manager to oversee operations and manage employees
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="ml-auto">
                  Step 2 of 3
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="managerEmail"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  Manager Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="managerEmail"
                  type="email"
                  placeholder="manager@example.com"
                  value={managerData.email}
                  onChange={(e) =>
                    setManagerData({ ...managerData, email: e.target.value })
                  }
                  className="h-11"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Note: For demo purposes, using yashnimse92@gmail.com as
                  manager
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <Mail className="h-4 w-4 text-primary mt-0.5" />
                  <span>
                    The manager will be added to your warehouse with full
                    management permissions to oversee operations and manage
                    employees.
                  </span>
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-12"
                  size="lg"
                  disabled={isLoading}
                >
                  <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
                  Back
                </Button>
                <Button
                  className="flex-1 h-12 text-base"
                  size="lg"
                  onClick={handleInviteManager}
                  disabled={!managerData.email || isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
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
                    <CardTitle className="text-2xl">
                      You&apos;re All Set! 🎉
                    </CardTitle>
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
                        <div className="font-semibold text-lg mb-1">
                          Company Created
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Demo Company
                        </div>
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
                        <div className="font-semibold text-lg mb-1">
                          Warehouse Created
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {warehouseData.name || "Main Warehouse"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {warehouseData.address ||
                            warehouseData.city ||
                            "Location not set"}
                        </div>
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
                        <div className="font-semibold text-lg mb-1">
                          Manager Invited
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {managerData.email || "manager@example.com"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Warehouse Manager
                        </div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  🚀 Your inventory management system is ready to use. You can
                  now start adding products, managing stock, and tracking
                  warehouse operations.
                </p>
              </div>
              <Button
                className="w-full h-12 text-base"
                size="lg"
                onClick={handleComplete}
              >
                <Package className="mr-2 h-5 w-5" />
                Restart Onboarding
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
