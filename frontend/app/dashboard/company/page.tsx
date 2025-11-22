"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Building2, Mail, Phone, MapPin } from "lucide-react"

export default function CompanyPage() {
  // Mock page, no auth
  const mockCompany = {
    name: "Demo Company",
    email: "company@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business St",
    city: "New York",
    country: "USA"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
        <p className="text-muted-foreground">Manage your company information and settings</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Your company details and contact information</CardDescription>
              </div>
              <Badge variant="secondary">Owner</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    defaultValue={mockCompany.name}
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyEmail"
                    type="email"
                    defaultValue={mockCompany.email}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  defaultValue={mockCompany.phone}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  defaultValue={mockCompany.address}
                  disabled
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  defaultValue={mockCompany.city}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  defaultValue={mockCompany.country}
                  disabled
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing & Subscription</CardTitle>
            <CardDescription>Manage your subscription and billing details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">Current Plan</div>
                <div className="text-sm text-muted-foreground">Professional</div>
              </div>
              <Badge>Active</Badge>
            </div>
            <Button variant="outline" className="w-full">Manage Subscription</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
