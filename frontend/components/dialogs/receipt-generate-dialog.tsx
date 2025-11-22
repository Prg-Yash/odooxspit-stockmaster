"use client"
import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { Plus } from "lucide-react"

export function ReceiptGenerateDialog() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    vendor: "",
    amount: "",
    date: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // mock: just close dialog
    setOpen(false)
    setForm({ vendor: "", amount: "", date: "" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 whitespace-nowrap w-full sm:w-auto">
          <Plus size={18} /> Generate Receipt
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Generate Receipt</DialogTitle>
        <DialogDescription>Mock form to generate a receipt.</DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Input id="vendor" value={form.vendor} onChange={handleChange} required placeholder="Enter vendor name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" value={form.amount} onChange={handleChange} required placeholder="Enter amount" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={form.date} onChange={handleChange} required />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">Generate</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
