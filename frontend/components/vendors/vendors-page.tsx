"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2, Search, Mail, Phone, MapPin } from "lucide-react"
import type { Vendor } from "@/types"
import { VendorDialog } from "@/components/dialogs/vendor-dialog"

interface VendorsPageProps {
  vendors: Vendor[]
  setVendors: (vendors: Vendor[]) => void
  onRefresh?: () => void
}

export function VendorsPage({ vendors, setVendors, onRefresh }: VendorsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleDeleteVendor = (id: string) => {
    setVendors(vendors.filter((v) => v.id !== id))
  }

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 sm:flex-none sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-2"
          />
        </div>
        <div className="flex gap-2">
          <VendorDialog vendors={vendors} setVendors={setVendors} onRefresh={onRefresh} />
        </div>
      </div>
      {/* Vendors Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.map((vendor) => (
          <Card key={vendor.id} className="border-2 hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base md:text-lg">{vendor.name}</CardTitle>
                <div className="flex gap-1">
                  <VendorDialog
                    vendor={vendor}
                    vendors={vendors}
                    setVendors={setVendors}
                    onRefresh={onRefresh}
                    trigger={
                      <button className="p-1 hover:bg-primary/10 rounded transition-colors">
                        <Edit2 size={16} className="text-primary" />
                      </button>
                    }
                  />
                  <button
                    onClick={() => handleDeleteVendor(vendor.id)}
                    className="p-1 hover:bg-destructive/10 rounded transition-colors"
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-muted-foreground shrink-0" />
                <a href={`mailto:${vendor.email}`} className="text-primary hover:underline truncate">
                  {vendor.email}
                </a>
              </div>
              {vendor.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-muted-foreground shrink-0" />
                  <a href={`tel:${vendor.phone}`} className="text-primary hover:underline">
                    {vendor.phone}
                  </a>
                </div>
              )}
              {vendor.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-foreground">{vendor.address}</p>
                    <p className="text-muted-foreground">
                      {vendor.city}
                      {vendor.city && vendor.country && ", "}
                      {vendor.country}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
