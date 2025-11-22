"use client"
import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { Plus } from "lucide-react"

export function MoveHistoryDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    product: "",
    from: "",
    to: "",
    quantity: "",
    date: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // mock: just close dialog
    setOpen(false)
    setForm({ product: "", from: "", to: "", quantity: "", date: "" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 whitespace-nowrap w-full sm:w-auto">
          <Plus size={18} /> Add Move History
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add Move History</DialogTitle>
        <DialogDescription>Mock form to add a move history record.</DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Input id="product" value={form.product} onChange={handleChange} required placeholder="Enter product name or SKU" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="from">From Location</Label>
            <Input id="from" value={form.from} onChange={handleChange} required placeholder="Enter from location" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">To Location</Label>
            <Input id="to" value={form.to} onChange={handleChange} required placeholder="Enter to location" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" value={form.quantity} onChange={handleChange} required placeholder="Enter quantity" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={form.date} onChange={handleChange} required />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
