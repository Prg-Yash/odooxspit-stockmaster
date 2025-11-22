"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit2, AlertCircle } from "lucide-react"
import type { Warehouse } from "@/types"

interface WarehousesPageProps {
  warehouses: Warehouse[]
  setWarehouses: (warehouses: Warehouse[]) => void
}

export function WarehousesPage({ warehouses, setWarehouses }: WarehousesPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
  })

  const handleAddWarehouse = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.location && formData.capacity) {
      if (editingId) {
        setWarehouses(
          warehouses.map((w) =>
            w.id === editingId
              ? {
                  ...w,
                  name: formData.name,
                  location: formData.location,
                  capacity: Number.parseInt(formData.capacity),
                }
              : w,
          ),
        )
        setEditingId(null)
      } else {
        const newWarehouse: Warehouse = {
          id: Date.now().toString(),
          name: formData.name,
          location: formData.location,
          capacity: Number.parseInt(formData.capacity),
          usedCapacity: 0,
          locations: [],
        }
        setWarehouses([...warehouses, newWarehouse])
      }
      setFormData({ name: "", location: "", capacity: "" })
      setShowForm(false)
    }
  }

  const handleDeleteWarehouse = (id: string) => {
    setWarehouses(warehouses.filter((w) => w.id !== id))
  }

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      capacity: warehouse.capacity.toString(),
    })
    setEditingId(warehouse.id)
    setShowForm(true)
  }

  const getCapacityPercentage = (warehouse: Warehouse) => {
    return Math.round((warehouse.usedCapacity / warehouse.capacity) * 100)
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Manage Warehouses</h2>
          <p className="text-sm text-muted-foreground">Total: {warehouses.length} warehouses</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ name: "", location: "", capacity: "" })
          }}
          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 whitespace-nowrap w-full sm:w-auto"
        >
          <Plus size={18} /> Add Warehouse
        </Button>
      </div>

      {/* Add/Edit Warehouse Form */}
      {showForm && (
        <Card className="border-2 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? "Edit Warehouse" : "Add New Warehouse"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddWarehouse} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Warehouse Name *</Label>
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
                  <Label htmlFor="location">Location *</Label>
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
                  <Label htmlFor="capacity">Capacity (units) *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="Enter capacity"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="border-2"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4 flex-wrap">
                <Button type="submit" className="bg-accent hover:bg-accent/90">
                  {editingId ? "Update Warehouse" : "Add Warehouse"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-2">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Warehouses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses.map((warehouse) => {
          const capacityPercent = getCapacityPercentage(warehouse)
          const isNearCapacity = capacityPercent > 80

          return (
            <Card key={warehouse.id} className="border-2 hover:shadow-lg transition-all duration-300 animate-scale-in">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base md:text-lg">{warehouse.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{warehouse.location}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditWarehouse(warehouse)}
                      className="p-1 hover:bg-primary/10 rounded transition-colors"
                    >
                      <Edit2 size={16} className="text-primary" />
                    </button>
                    <button
                      onClick={() => handleDeleteWarehouse(warehouse.id)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capacity Usage</span>
                    <span className={`font-semibold ${isNearCapacity ? "text-destructive" : "text-primary"}`}>
                      {capacityPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isNearCapacity ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {warehouse.usedCapacity} / {warehouse.capacity} units
                  </p>
                </div>

                {isNearCapacity && (
                  <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded border border-destructive/30">
                    <AlertCircle size={16} className="text-destructive shrink-0" />
                    <span className="text-xs text-destructive">Near capacity</span>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Locations: {warehouse.locations.length}</p>
                  <div className="flex flex-wrap gap-2">
                    {warehouse.locations.map((loc) => (
                      <span key={loc.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {loc.name}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
