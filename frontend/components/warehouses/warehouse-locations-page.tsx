"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import type { Warehouse, WarehouseLocation } from "@/types"
import { LocationCreateDialog } from "@/components/dialogs/location-create-dialog"

interface WarehouseLocationsPageProps {
  warehouses: Warehouse[]
  setWarehouses: (warehouses: Warehouse[]) => void
}

export function WarehouseLocationsPage({ warehouses, setWarehouses }: WarehouseLocationsPageProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(warehouses[0]?.id || "")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    type: "rack" | "shelf" | "production" | "storage"
    capacity: string
  }>({
    name: "",
    type: "rack",
    capacity: "",
  })

  const currentWarehouse = warehouses.find((w) => w.id === selectedWarehouse)

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentWarehouse && formData.name && formData.capacity) {
      setWarehouses(
        warehouses.map((w) => {
          if (w.id === selectedWarehouse) {
            if (editingId) {
              return {
                ...w,
                locations: w.locations.map((loc) =>
                  loc.id === editingId
                    ? {
                        ...loc,
                        name: formData.name,
                        type: formData.type,
                        capacity: Number.parseInt(formData.capacity),
                      }
                    : loc,
                ),
              }
            } else {
              const newLocation: WarehouseLocation = {
                id: Date.now().toString(),
                warehouseId: w.id,
                name: formData.name,
                type: formData.type,
                capacity: Number.parseInt(formData.capacity),
                usedCapacity: 0,
              }
              return {
                ...w,
                locations: [...w.locations, newLocation],
              }
            }
          }
          return w
        }),
      )
      setEditingId(null)
      setFormData({ name: "", type: "rack", capacity: "" })
      setShowForm(false)
    }
  }

  const handleDeleteLocation = (locationId: string) => {
    setWarehouses(
      warehouses.map((w) => {
        if (w.id === selectedWarehouse) {
          return {
            ...w,
            locations: w.locations.filter((l) => l.id !== locationId),
          }
        }
        return w
      }),
    )
  }

  // Removed handleEditLocation and legacy edit state. Only dialog is used for adding locations.

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Warehouse Selector */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Select Warehouse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-end">
            <div className="flex-1">
              <Label htmlFor="warehouse-select" className="text-sm">
                Warehouse
              </Label>
              <select
                id="warehouse-select"
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full px-3 py-2 border-2 border-border rounded-lg bg-input text-foreground mt-2"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} - {w.location}
                  </option>
                ))}
              </select>
            </div>
            <LocationCreateDialog />
          </div>
        </CardContent>
      </Card>

      {currentWarehouse && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{currentWarehouse.name} - Locations</h2>
              <p className="text-sm text-muted-foreground">Total: {currentWarehouse.locations.length} locations</p>
            </div>
          </div>

          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentWarehouse.locations.map((location) => {
              const capacityPercent = Math.round((location.usedCapacity / location.capacity) * 100)

              return (
                <Card
                  key={location.id}
                  className="border-2 hover:shadow-lg transition-all duration-300 animate-scale-in"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{location.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{location.type}</p>
                      </div>
                      <div className="flex gap-1">
                        {/* Edit button removed: editing now handled via dialog only if needed */}
                        <button
                          onClick={() => handleDeleteLocation(location.id)}
                          className="p-1 hover:bg-destructive/10 rounded transition-colors"
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Usage</span>
                        <span className="font-semibold text-primary">{capacityPercent}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-primary transition-all duration-300"
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {location.usedCapacity} / {location.capacity} units
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
