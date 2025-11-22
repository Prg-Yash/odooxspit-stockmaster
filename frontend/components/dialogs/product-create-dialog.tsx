"use client"
import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"
import { Plus } from "lucide-react"

export function ProductCreateDialog() {
  const { products, setProducts } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.sku) return
    const newProduct = {
      id: Date.now().toString(),
      name: form.name,
      sku: form.sku,
      category: form.category,
      price: Number.parseFloat(form.price),
      quantity: Number.parseInt(form.quantity),
      description: form.description,
      createdAt: new Date().toISOString().split("T")[0],
      history: [
        {
          id: "h" + Date.now(),
          action: "created" as const,
          quantity: Number.parseInt(form.quantity),
          previousQuantity: 0,
          date: new Date().toISOString().split("T")[0],
        },
      ],
    }
    setProducts([...products, newProduct])
    setOpen(false)
    setForm({ name: "", sku: "", category: "", price: "", quantity: "", description: "" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 whitespace-nowrap w-full sm:w-auto">
          <Plus size={18} /> Create Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create New Product</DialogTitle>
        <DialogDescription>Fill in the details to add a new product.</DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" value={form.name} onChange={handleChange} required placeholder="Enter product name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" value={form.sku} onChange={handleChange} required placeholder="Enter SKU" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={form.category} onChange={handleChange} placeholder="Enter category" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" value={form.price} onChange={handleChange} placeholder="Enter price" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Initial Quantity</Label>
              <Input id="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="Enter quantity" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={handleChange} placeholder="Enter product description" rows={3} />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">Create Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
