"use client"
import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { Plus } from "lucide-react"

export function LocationCreateDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    type: "",
    capacity: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // mock: just close dialog
    setOpen(false)
    setForm({ name: "", type: "", capacity: "" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 whitespace-nowrap w-full sm:w-auto">
          <Plus size={18} /> Create Location
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create Location</DialogTitle>
        <DialogDescription>Mock form to create a warehouse location.</DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Location Name</Label>
            <Input id="name" value={form.name} onChange={handleChange} required placeholder="Enter location name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input id="type" value={form.type} onChange={handleChange} required placeholder="Enter type (rack, shelf, etc.)" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input id="capacity" type="number" value={form.capacity} onChange={handleChange} required placeholder="Enter capacity" />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
