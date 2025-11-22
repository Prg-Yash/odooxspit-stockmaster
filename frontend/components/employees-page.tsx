"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Building2, AlertCircle } from "lucide-react";
import { getAllEmployees, getCurrentUser, type User } from "@/lib/api/user";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function EmployeesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [employees, setEmployees] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      // Check if user is OWNER
      const userResponse = await getCurrentUser();
      const user = userResponse.data.user;
      setCurrentUser(user);

      if (user.role !== "OWNER") {
        toast({
          title: "Access Denied",
          description: "Only owners can view the employees page",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }

      // Fetch all employees
      await fetchEmployees();
    } catch (error) {
      console.error("Failed to check access:", error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await getAllEmployees();
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "OWNER":
        return "default";
      case "MANAGER":
        return "secondary";
      case "STAFF":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading employees...</p>
          </div>
        </div>
      </div>
    );
  }

  // Group employees by role
  const owners = employees.filter((e) => e.role === "OWNER");
  const managers = employees.filter((e) => e.role === "MANAGER");
  const staff = employees.filter((e) => e.role === "STAFF");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            All Employees
          </h2>
          <p className="text-sm text-muted-foreground">
            Total: {employees.length} employees
          </p>
        </div>
      </div>

      {/* Owners Section */}
      {owners.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-primary">
            Owners ({owners.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {owners.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                variant={getRoleBadgeVariant(employee.role)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Managers Section */}
      {managers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">
            Managers ({managers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managers.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                variant={getRoleBadgeVariant(employee.role)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Staff Section */}
      {staff.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Staff ({staff.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                variant={getRoleBadgeVariant(employee.role)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {employees.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No employees found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface EmployeeCardProps {
  employee: User;
  variant: "default" | "secondary" | "outline";
}

function EmployeeCard({ employee, variant }: EmployeeCardProps) {
  const warehouseCount = employee.warehouseMemberships?.length || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">
              {employee.name || "No Name"}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Mail className="h-3 w-3" />
              <span className="text-xs">{employee.email}</span>
            </CardDescription>
          </div>
          <Badge variant={variant}>{employee.role}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Warehouse Assignments */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>
            {warehouseCount} warehouse{warehouseCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Show warehouse details */}
        {employee.warehouseMemberships &&
          employee.warehouseMemberships.length > 0 && (
            <div className="mt-3 space-y-1">
              {employee.warehouseMemberships.map((membership) => (
                <div
                  key={membership.id}
                  className="text-xs p-2 bg-muted/50 rounded flex items-center justify-between"
                >
                  <span className="font-medium">
                    {membership.warehouse.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {membership.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
