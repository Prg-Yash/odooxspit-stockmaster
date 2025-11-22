"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit2, Trash2, Search, Mail, Phone, MapPin } from "lucide-react"
import type { Vendor } from "@/types"

interface VendorsPageProps {
  vendors: Vendor[]
  setVendors: (vendors: Vendor[]) => void
}

export function VendorsPage({ vendors, setVendors }: VendorsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  })

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.email) {
      if (editingId) {
        setVendors(
          vendors.map((v) =>
            v.id === editingId
              ? {
                  ...v,
                  ...formData,
                }
              : v,
          ),
        )
        setEditingId(null)
      } else {
        const newVendor: Vendor = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString().split("T")[0],
        }
        setVendors([...vendors, newVendor])
      }
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
      })
      setShowForm(false)
    }
  }

  const handleDeleteVendor = (id: string) => {
    setVendors(vendors.filter((v) => v.id !== id))
  }

  const handleEditVendor = (vendor: Vendor) => {
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      city: vendor.city,
      country: vendor.country,
    })
    setEditingId(vendor.id)
    setShowForm(true)
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
        <Button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({
              name: "",
              email: "",
              phone: "",
              address: "",
              city: "",
              country: "",
            })
          }}
          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 whitespace-nowrap w-full sm:w-auto"
        >
          <Plus size={18} /> Add Vendor
        </Button>
      </div>

      {/* Add/Edit Vendor Form */}
      {showForm && (
        <Card className="border-2 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? "Edit Vendor" : "Add New Vendor"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddVendor} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Vendor Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter vendor name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="Enter country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="border-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4 flex-wrap">
                <Button type="submit" className="bg-accent hover:bg-accent/90">
                  {editingId ? "Update Vendor" : "Add Vendor"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-2">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Vendors Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.map((vendor) => (
          <Card key={vendor.id} className="border-2 hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base md:text-lg">{vendor.name}</CardTitle>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditVendor(vendor)}
                    className="p-1 hover:bg-primary/10 rounded transition-colors"
                  >
                    <Edit2 size={16} className="text-primary" />
                  </button>
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
