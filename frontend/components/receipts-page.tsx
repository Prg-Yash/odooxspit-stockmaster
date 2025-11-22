"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Download, Eye, Trash2 } from "lucide-react"

interface Receipt {
  id: string
  receiptNumber: string
  supplier: string
  date: string
  items: number
  total: number
  status: "draft" | "confirmed" | "received"
}

export function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      id: "1",
      receiptNumber: "REC-2024-001",
      supplier: "Tech Supplies Inc",
      date: "2024-01-15",
      items: 5,
      total: 4500,
      status: "received",
    },
    {
      id: "2",
      receiptNumber: "REC-2024-002",
      supplier: "Electronics Ltd",
      date: "2024-01-18",
      items: 3,
      total: 3200,
      status: "confirmed",
    },
    {
      id: "3",
      receiptNumber: "REC-2024-003",
      supplier: "Office Equipment Co",
      date: "2024-01-19",
      items: 8,
      total: 2100,
      status: "draft",
    },
  ])

  const [filterStatus, setFilterStatus] = useState<"all" | Receipt["status"]>("all")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    supplier: "",
    items: "",
    total: "",
  })

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.supplier) {
      setReceipts([
        ...receipts,
        {
          id: Date.now().toString(),
          receiptNumber: `REC-${new Date().getFullYear()}-${String(receipts.length + 1).padStart(3, "0")}`,
          supplier: formData.supplier,
          date: new Date().toISOString().split("T")[0],
          items: Number.parseInt(formData.items) || 0,
          total: Number.parseFloat(formData.total) || 0,
          status: "draft",
        },
      ])
      setFormData({ supplier: "", items: "", total: "" })
      setShowForm(false)
    }
  }

  const filteredReceipts = receipts.filter((r) => (filterStatus === "all" ? true : r.status === filterStatus))

  const getStatusColor = (status: Receipt["status"]) => {
    switch (status) {
      case "draft":
        return "bg-muted text-muted-foreground border-border"
      case "confirmed":
        return "bg-primary/20 text-primary border-primary/30"
      case "received":
        return "bg-chart-1/20 text-chart-1 border-chart-1/30"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Total Receipts: {receipts.length}</h2>
          <p className="text-sm text-muted-foreground">Generate and manage purchase receipts</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 whitespace-nowrap"
        >
          <Plus size={18} /> Generate Receipt
        </Button>
      </div>

      {/* Create Receipt Form */}
      {showForm && (
        <Card className="border-2 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-lg">Create New Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateReceipt} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier Name</Label>
                  <Input
                    id="supplier"
                    placeholder="Enter supplier name"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="border-2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="items">Number of Items</Label>
                  <Input
                    id="items"
                    type="number"
                    placeholder="Enter item count"
                    value={formData.items}
                    onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                    className="border-2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="total">Total Amount</Label>
                <Input
                  id="total"
                  type="number"
                  placeholder="Enter total amount"
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  className="border-2"
                  step="0.01"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-accent hover:bg-accent/90">
                  Create Receipt
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-2">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "draft", "confirmed", "received"] as const).map((status) => (
          <Button
            key={status}
            onClick={() => setFilterStatus(status)}
            variant={filterStatus === status ? "default" : "outline"}
            className={`capitalize ${filterStatus === status ? "bg-accent text-accent-foreground" : "border-2"}`}
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Receipts Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Receipts ({filteredReceipts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Receipt #</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Supplier</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Items</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Total</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{receipt.receiptNumber}</td>
                    <td className="py-3 px-4 text-muted-foreground">{receipt.supplier}</td>
                    <td className="py-3 px-4 text-muted-foreground">{receipt.date}</td>
                    <td className="py-3 px-4 text-center font-semibold">{receipt.items}</td>
                    <td className="py-3 px-4 text-right text-foreground font-semibold">${receipt.total.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(receipt.status)}`}
                      >
                        {receipt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button className="p-1 hover:bg-primary/10 rounded transition-colors" title="View">
                          <Eye size={16} className="text-primary" />
                        </button>
                        <button className="p-1 hover:bg-primary/10 rounded transition-colors" title="Download">
                          <Download size={16} className="text-primary" />
                        </button>
                        <button className="p-1 hover:bg-destructive/10 rounded transition-colors" title="Delete">
                          <Trash2 size={16} className="text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
