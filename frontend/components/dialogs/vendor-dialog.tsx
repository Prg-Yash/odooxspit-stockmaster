"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FieldGroup, FieldLabel, Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Plus, Edit2 } from "lucide-react"
import type { Vendor } from "@/types"

interface VendorDialogProps {
  vendor?: Vendor
  vendors: Vendor[]
  setVendors: (vendors: Vendor[]) => void
  trigger?: React.ReactNode
}

export function VendorDialog({ vendor, vendors, setVendors, trigger }: VendorDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  })

  useEffect(() => {
    if (vendor && open) {
      setFormData({
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        city: vendor.city,
        country: vendor.country,
      })
    } else if (!open) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
      })
    }
  }, [vendor, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.email) {
      if (vendor) {
        // Edit existing vendor
        setVendors(
          vendors.map((v) =>
            v.id === vendor.id
              ? {
                  ...v,
                  ...formData,
                }
              : v,
          ),
        )
      } else {
        // Add new vendor
        const newVendor: Vendor = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString().split("T")[0],
        }
        setVendors([...vendors, newVendor])
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
            Add Vendor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          <DialogDescription>
            {vendor ? "Update the vendor details below" : "Enter the details of the new vendor"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldGroup>
              <FieldLabel>Vendor Name</FieldLabel>
              <Field>
                <Input
                  placeholder="Tech Supplies Inc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Email</FieldLabel>
              <Field>
                <Input
                  type="email"
                  placeholder="contact@vendor.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Phone</FieldLabel>
              <Field>
                <Input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Address</FieldLabel>
              <Field>
                <Input
                  placeholder="123 Business St"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>City</FieldLabel>
              <Field>
                <Input
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Country</FieldLabel>
              <Field>
                <Input
                  placeholder="United States"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {vendor ? "Update Vendor" : "Add Vendor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
