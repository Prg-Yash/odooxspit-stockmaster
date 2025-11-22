"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FieldGroup, FieldLabel, Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Plus, Edit2 } from "lucide-react"
import type { Warehouse } from "@/types"

interface WarehouseDialogProps {
  warehouse?: Warehouse
  warehouses: Warehouse[]
  setWarehouses: (warehouses: Warehouse[]) => void
  trigger?: React.ReactNode
}

export function WarehouseDialog({ warehouse, warehouses, setWarehouses, trigger }: WarehouseDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
  })

  useEffect(() => {
    if (warehouse && open) {
      setFormData({
        name: warehouse.name,
        location: warehouse.location,
        capacity: warehouse.capacity.toString(),
      })
    } else if (!open) {
      setFormData({ name: "", location: "", capacity: "" })
    }
  }, [warehouse, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.location && formData.capacity) {
      if (warehouse) {
        // Edit existing warehouse
        setWarehouses(
          warehouses.map((w) =>
            w.id === warehouse.id
              ? {
                  ...w,
                  name: formData.name,
                  location: formData.location,
                  capacity: Number.parseInt(formData.capacity),
                }
              : w,
          ),
        )
      } else {
        // Add new warehouse
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
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus size={18} />
            Add Warehouse
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{warehouse ? "Edit Warehouse" : "Add New Warehouse"}</DialogTitle>
          <DialogDescription>
            {warehouse ? "Update the warehouse details below" : "Enter the details of the new warehouse"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <FieldGroup>
            <FieldLabel>Warehouse Name</FieldLabel>
            <Field>
              <Input
                placeholder="Main Warehouse"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Location</FieldLabel>
            <Field>
              <Input
                placeholder="123 Business Park, City"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Capacity (units)</FieldLabel>
            <Field>
              <Input
                type="number"
                min="0"
                placeholder="10000"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {warehouse ? "Update Warehouse" : "Add Warehouse"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
