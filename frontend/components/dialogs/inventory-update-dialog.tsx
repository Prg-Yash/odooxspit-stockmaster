"use client"
import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { adjustStock, receiveStock } from "@/lib/api/stock"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Product {
  productId: string
  productName: string
  sku: string
  isActive: boolean
}

interface Location {
  id: string
  name: string
}

interface InventoryUpdateDialogProps {
  onSuccess?: () => void
  warehouseId: string
  products: Product[]
  locations: Location[]
}

export function InventoryUpdateDialog({ onSuccess, warehouseId, products, locations }: InventoryUpdateDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    productId: "",
    locationId: "",
    action: "adjust" as "adjust" | "receive",
    quantity: "",
    notes: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!warehouseId) {
      toast.error("No warehouse selected")
      return
    }

    if (!form.productId || !form.locationId || !form.quantity) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      setLoading(true)
      const quantity = parseInt(form.quantity)

      if (isNaN(quantity) || quantity < 0) {
        toast.error("Please enter a valid quantity")
        return
      }

      if (form.action === "adjust") {
        await adjustStock({
          productId: form.productId,
          warehouseId,
          locationId: form.locationId,
          newQuantity: quantity,
          notes: form.notes,
        })
        toast.success("Stock adjusted successfully!")
      } else {
        await receiveStock(warehouseId, {
          productId: form.productId,
          locationId: form.locationId,
          quantity,
          notes: form.notes,
        })
        toast.success("Stock received successfully!")
      }

      setOpen(false)
      setForm({
        productId: "",
        locationId: "",
        action: "adjust",
        quantity: "",
        notes: "",
      })
      onSuccess?.()
    } catch (error: any) {
      console.error("Stock update error:", error)
      toast.error(error.message || "Failed to update stock")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 whitespace-nowrap w-full sm:w-auto">
          <Plus size={18} /> Update Inventory
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle>Update Inventory</DialogTitle>
        <DialogDescription>
          {form.action === "adjust" ? "Set stock to a specific quantity" : "Add stock to existing inventory"}
        </DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <Select
              value={form.productId}
              onValueChange={(value) => setForm({ ...form, productId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.productId} value={product.productId}>
                    {product.productName} ({product.sku})
                    {!product.isActive && <span className="text-red-500 ml-2">(Inactive)</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              value={form.locationId}
              onValueChange={(value) => setForm({ ...form, locationId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Action</Label>
            <Select
              value={form.action}
              onValueChange={(value: "adjust" | "receive") => setForm({ ...form, action: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adjust">Adjust (Set to specific quantity)</SelectItem>
                <SelectItem value="receive">Receive (Add to current stock)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {form.action === "adjust" ? "New Quantity" : "Quantity to Add"}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
              placeholder={form.action === "adjust" ? "Enter new total" : "Enter amount to add"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Reason for adjustment..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Stock"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
