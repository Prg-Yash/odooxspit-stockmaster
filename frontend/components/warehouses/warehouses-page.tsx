"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Warehouse,
  Building2,
  Users,
  MapPin,
  Package,
  Plus,
  UserPlus,
  Search,
  Loader2,
  Mail,
} from "lucide-react";
import {
  createWarehouse,
  getWarehouses,
  addWarehouseMember,
  getWarehouseMembers,
  type Warehouse as WarehouseType,
  type WarehouseMember,
} from "@/lib/api/warehouse";
import {
  searchUsers,
  getCurrentUser,
  type User as ApiUser,
} from "@/lib/api/user";
import { useToast } from "@/hooks/use-toast";
import { APIError } from "@/lib/api-client";

interface WarehousesPageProps {
  warehouses: any[];
  setWarehouses: (warehouses: any[]) => void;
}

export function WarehousesPage({
  warehouses: _warehouses,
  setWarehouses: _setWarehouses,
}: WarehousesPageProps) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<WarehouseType | null>(null);
  const [warehouseMembers, setWarehouseMembers] = useState<
    Record<string, WarehouseMember[]>
  >({});

  // Create warehouse state
  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    code: "",
    capacity: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });

  // Staff search state
  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ApiUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Fetch current user and warehouses on mount
  useEffect(() => {
    fetchCurrentUser();
    fetchWarehouses();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await getCurrentUser();
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      setIsLoading(true);
      const response = await getWarehouses();

      // Handle different response structures
      const warehousesData = response.data?.warehouses || response.data || [];
      setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);

      // Fetch members for each warehouse
      if (Array.isArray(warehousesData)) {
        for (const warehouse of warehousesData) {
          fetchWarehouseMembers(warehouse.id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
      toast({
        title: "Error",
        description: "Failed to load warehouses",
        variant: "destructive",
      });
      setWarehouses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWarehouseMembers = async (warehouseId: string) => {
    try {
      const response = await getWarehouseMembers(warehouseId);
      console.log(`Members for warehouse ${warehouseId}:`, response.data);

      // Handle different response structures
      const membersData = response.data?.members || response.data || [];
      console.log(`Processed members:`, membersData);

      setWarehouseMembers((prev) => ({
        ...prev,
        [warehouseId]: Array.isArray(membersData) ? membersData : [],
      }));
    } catch (error) {
      console.error("Failed to fetch warehouse members:", error);
    }
  };

  const handleCreateWarehouse = async () => {
    if (!newWarehouse.name || !newWarehouse.code) {
      toast({
        title: "Validation Error",
        description: "Warehouse name and code are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await createWarehouse(newWarehouse);
      const warehouseName = response.data?.warehouse?.name || newWarehouse.name;
      toast({
        title: "Success",
        description: `Warehouse "${warehouseName}" created successfully`,
      });
      setIsCreateDialogOpen(false);
      setNewWarehouse({
        name: "",
        code: "",
        capacity: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
      });
      fetchWarehouses();
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
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  const handleSearchUsers = async () => {
    if (!searchEmail.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchUsers(searchEmail);
      setSearchResults(response.data.users);

      if (response.data.users.length === 0) {
        toast({
          title: "No users found",
          description: "No verified users found with that email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search users error:", error);
      toast({
        title: "Search failed",
        description: "Could not search for users",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddStaff = async () => {
    if (!selectedWarehouse || !selectedUser) return;

    setIsAddingMember(true);
    try {
      await addWarehouseMember(selectedWarehouse.id, {
        userId: selectedUser.id,
        role: "STAFF",
      });

      toast({
        title: "Success",
        description: `Staff member added successfully. Email sent to ${selectedUser.email}`,
      });

      setIsAddStaffDialogOpen(false);
      setSelectedUser(null);
      setSearchEmail("");
      setSearchResults([]);
      fetchWarehouseMembers(selectedWarehouse.id);
    } catch (error) {
      console.error("Add staff error:", error);
      if (error instanceof APIError) {
        toast({
          title: "Failed to add staff",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsAddingMember(false);
    }
  };

  const openAddStaffDialog = (warehouse: WarehouseType) => {
    setSelectedWarehouse(warehouse);
    setIsAddStaffDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Manage Warehouses
          </h2>
          <p className="text-sm text-muted-foreground">
            Total: {warehouses.length} warehouses
          </p>
        </div>

        {/* Create Warehouse Dialog - Only for OWNER */}
        {currentUser?.role === "OWNER" && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Warehouse
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Warehouse</DialogTitle>
                <DialogDescription>
                  Add a new warehouse to your inventory system
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Warehouse Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Main Warehouse"
                      value={newWarehouse.name}
                      onChange={(e) =>
                        setNewWarehouse({
                          ...newWarehouse,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">
                      Warehouse Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="code"
                      placeholder="WH-001"
                      value={newWarehouse.code}
                      onChange={(e) =>
                        setNewWarehouse({
                          ...newWarehouse,
                          code: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    placeholder="e.g., 10,000 sq ft or 5,000 pallets"
                    value={newWarehouse.capacity}
                    onChange={(e) =>
                      setNewWarehouse({
                        ...newWarehouse,
                        capacity: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Industrial Avenue"
                    value={newWarehouse.address}
                    onChange={(e) =>
                      setNewWarehouse({
                        ...newWarehouse,
                        address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      value={newWarehouse.city}
                      onChange={(e) =>
                        setNewWarehouse({
                          ...newWarehouse,
                          city: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      value={newWarehouse.state}
                      onChange={(e) =>
                        setNewWarehouse({
                          ...newWarehouse,
                          state: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="India"
                      value={newWarehouse.country}
                      onChange={(e) =>
                        setNewWarehouse({
                          ...newWarehouse,
                          country: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="400001"
                      value={newWarehouse.postalCode}
                      onChange={(e) =>
                        setNewWarehouse({
                          ...newWarehouse,
                          postalCode: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateWarehouse}>
                  Create Warehouse
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Warehouses List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {warehouses.map((warehouse) => {
          const members = warehouseMembers[warehouse.id] || [];
          console.log(`Warehouse ${warehouse.name} (${warehouse.id}):`, {
            membersCount: members.length,
            members: members,
            allWarehouseMembers: warehouseMembers,
          });
          const owner = members.find((m) => m.role === "OWNER");
          const managers = members.filter((m) => m.role === "MANAGER");
          const staff = members.filter((m) => m.role === "STAFF");

          return (
            <Card
              key={warehouse.id}
              className="border-2 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base md:text-lg">
                        {warehouse.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-3 w-3" />
                        <span className="text-xs">Code: {warehouse.code}</span>
                      </div>
                      {warehouse.capacity && (
                        <div className="flex items-center gap-2">
                          <Warehouse className="h-3 w-3" />
                          <span className="text-xs">
                            Capacity: {warehouse.capacity}
                          </span>
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {members.length}{" "}
                    {members.length === 1 ? "member" : "members"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Location Information */}
                {(warehouse.address || warehouse.city || warehouse.state) && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>Location</span>
                    </div>
                    <div className="text-sm text-muted-foreground pl-6">
                      {warehouse.address && <div>{warehouse.address}</div>}
                      <div>
                        {[
                          warehouse.city,
                          warehouse.state,
                          warehouse.country,
                          warehouse.postalCode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Members */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Team</span>
                    </div>
                    <div className="flex gap-2">
                      {/* View Team Button - For Owner and Manager */}
                      {(currentUser?.role === "OWNER" ||
                        currentUser?.role === "MANAGER") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedWarehouse(warehouse);
                            setIsTeamDialogOpen(true);
                          }}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          View Team
                        </Button>
                      )}
                      {/* Add Staff Button - Only for Owner and Manager */}
                      {(currentUser?.role === "OWNER" ||
                        currentUser?.role === "MANAGER") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAddStaffDialog(warehouse)}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Add Staff
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pl-6">
                    {/* Show summary for all roles */}
                    <div className="text-sm text-muted-foreground">
                      {managers.length > 0 && (
                        <div>
                          {managers.length} Manager
                          {managers.length !== 1 ? "s" : ""}
                        </div>
                      )}
                      {staff.length > 0 && (
                        <div>
                          {staff.length} Staff member
                          {staff.length !== 1 ? "s" : ""}
                        </div>
                      )}
                      {members.length === 0 && <div>No team members yet</div>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Staff Dialog */}
      <Dialog
        open={isAddStaffDialogOpen}
        onOpenChange={setIsAddStaffDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Search and add a staff member to {selectedWarehouse?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="searchEmail">Search User by Email</Label>
              <div className="flex gap-2">
                <Input
                  id="searchEmail"
                  type="email"
                  placeholder="Enter email to search..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchUsers();
                    }
                  }}
                />
                <Button
                  onClick={handleSearchUsers}
                  disabled={isSearching || !searchEmail.trim()}
                  size="icon"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <Label>Search Results</Label>
                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 flex items-center justify-between hover:bg-secondary/50 cursor-pointer transition-colors ${
                        selectedUser?.id === user.id
                          ? "bg-primary/10 border-l-4 border-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {user.name || user.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        {user.warehouseMemberships &&
                          user.warehouseMemberships.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Member of:{" "}
                              {user.warehouseMemberships[0].warehouse.name}
                            </div>
                          )}
                      </div>
                      {/* <Badge variant="outline">{user.role}</Badge> */}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected User */}
            {selectedUser && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">Selected Staff</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedUser.email}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddStaffDialogOpen(false);
                setSelectedUser(null);
                setSearchEmail("");
                setSearchResults([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStaff}
              disabled={!selectedUser || isAddingMember}
            >
              {isAddingMember && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Team Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Team Members</DialogTitle>
            <DialogDescription>
              All team members for {selectedWarehouse?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedWarehouse &&
              (() => {
                const members = warehouseMembers[selectedWarehouse.id] || [];
                const owner = members.find((m) => m.role === "OWNER");
                const managers = members.filter((m) => m.role === "MANAGER");
                const staff = members.filter((m) => m.role === "STAFF");

                return (
                  <div className="space-y-4">
                    {/* Owner */}
                    {owner && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-primary">
                          Owner
                        </h4>
                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                          <div>
                            <div className="font-medium">
                              {owner.user.name || owner.user.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {owner.user.email}
                            </div>
                          </div>
                          <Badge variant="default">Owner</Badge>
                        </div>
                      </div>
                    )}

                    {/* Managers */}
                    {managers.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Managers</h4>
                        {managers.map((manager) => (
                          <div
                            key={manager.id}
                            className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                          >
                            <div>
                              <div className="font-medium">
                                {manager.user.name || manager.user.email}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {manager.user.email}
                              </div>
                            </div>
                            <Badge variant="secondary">Manager</Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Staff */}
                    {staff.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Staff</h4>
                        {staff.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium">
                                {member.user.name || member.user.email}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {member.user.email}
                              </div>
                            </div>
                            <Badge variant="outline">Staff</Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {members.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No team members yet
                      </div>
                    )}
                  </div>
                );
              })()}
          </div>
        </DialogContent>
      </Dialog>

      {warehouses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Warehouse className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No warehouses found. Create your first warehouse to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
