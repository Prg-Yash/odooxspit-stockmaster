"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit2, AlertCircle } from "lucide-react"
import type { Warehouse } from "@/types"
import { WarehouseDialog } from "@/components/dialogs/warehouse-dialog"

interface WarehousesPageProps {
  warehouses: Warehouse[]
  setWarehouses: (warehouses: Warehouse[]) => void
}

export function WarehousesPage({ warehouses, setWarehouses }: WarehousesPageProps) {
  const handleDeleteWarehouse = (id: string) => {
    setWarehouses(warehouses.filter((w) => w.id !== id))
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
        <WarehouseDialog warehouses={warehouses} setWarehouses={setWarehouses} />
      </div>
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
                    <WarehouseDialog
                      warehouse={warehouse}
                      warehouses={warehouses}
                      setWarehouses={setWarehouses}
                      trigger={
                        <button className="p-1 hover:bg-primary/10 rounded transition-colors">
                          <Edit2 size={16} className="text-primary" />
                        </button>
                      }
                    />
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
