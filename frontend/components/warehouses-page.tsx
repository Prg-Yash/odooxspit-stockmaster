"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, MapPin, Users } from "lucide-react"

interface Warehouse {
  id: string
  name: string
  location: string
  capacity: number
  currentStock: number
  manager: string
  status: "active" | "inactive"
}

export function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: "1",
      name: "Main Warehouse",
      location: "New York, NY",
      capacity: 50000,
      currentStock: 38500,
      manager: "John Smith",
      status: "active",
    },
    {
      id: "2",
      name: "Branch A",
      location: "Los Angeles, CA",
      capacity: 30000,
      currentStock: 22300,
      manager: "Sarah Johnson",
      status: "active",
    },
    {
      id: "3",
      name: "Branch B",
      location: "Chicago, IL",
      capacity: 20000,
      currentStock: 15800,
      manager: "Mike Davis",
      status: "active",
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    manager: "",
  })

  const handleAddWarehouse = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.location) {
      setWarehouses([
        ...warehouses,
        {
          id: Date.now().toString(),
          name: formData.name,
          location: formData.location,
          capacity: Number.parseInt(formData.capacity) || 0,
          currentStock: 0,
          manager: formData.manager,
          status: "active",
        },
      ])
      setFormData({ name: "", location: "", capacity: "", manager: "" })
      setShowForm(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Total Warehouses: {warehouses.length}</h2>
          <p className="text-sm text-muted-foreground">Manage your warehouse locations and capacity</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 whitespace-nowrap"
        >
          <Plus size={18} /> Add Warehouse
        </Button>
      </div>

      {/* Add Warehouse Form */}
      {showForm && (
        <Card className="border-2 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-lg">Add New Warehouse</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddWarehouse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Warehouse Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter warehouse name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="border-2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (units)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="Enter capacity"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager Name</Label>
                  <Input
                    id="manager"
                    placeholder="Enter manager name"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="border-2"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-accent hover:bg-accent/90">
                  Save Warehouse
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-2">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map((warehouse) => {
          const utilizationPercent = (warehouse.currentStock / warehouse.capacity) * 100
          return (
            <Card key={warehouse.id} className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-foreground">{warehouse.name}</CardTitle>
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
                      <MapPin size={14} /> {warehouse.location}
                    </div>
                  </div>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      warehouse.status === "active" ? "bg-chart-1/20 text-chart-1" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {warehouse.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Capacity</span>
                    <span className="text-sm font-semibold text-foreground">{utilizationPercent.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {warehouse.currentStock.toLocaleString()} / {warehouse.capacity.toLocaleString()} units
                  </p>
                </div>

                <div className="flex items-center gap-2 text-foreground">
                  <Users size={16} className="text-primary" />
                  <span className="text-sm">{warehouse.manager}</span>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                  Manage Inventory
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
