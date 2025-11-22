"use client"
import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { Plus } from "lucide-react"

export function InventoryUpdateDialog() {
  const { products, setProducts } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    sku: "",
    quantity: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // mock: just close dialog
    setOpen(false)
    setForm({ sku: "", quantity: "" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 whitespace-nowrap w-full sm:w-auto">
          <Plus size={18} /> Update Inventory
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Update Inventory</DialogTitle>
        <DialogDescription>Mock form to update inventory quantity by SKU.</DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={form.sku} onChange={handleChange} required placeholder="Enter SKU" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" value={form.quantity} onChange={handleChange} required placeholder="Enter new quantity" />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
