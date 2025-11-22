"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Eye, Trash2, FileText } from "lucide-react"

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

  const handleDownload = (receipt: Receipt) => {
    console.log("[v0] Downloading receipt:", receipt.receiptNumber)
    const element = document.createElement("a")
    element.href = "data:text/plain;charset=utf-8," + encodeURIComponent(`Receipt: ${receipt.receiptNumber}`)
    element.download = `${receipt.receiptNumber}.txt`
    element.click()
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Total Receipts: {receipts.length}</h2>
          <p className="text-sm text-muted-foreground">Manage and view purchase receipts</p>
        </div>
        <Button
          onClick={() => (window.location.pathname = "/")}
          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 whitespace-nowrap w-full sm:w-auto"
        >
          <FileText size={18} /> Generate Receipt
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "draft", "confirmed", "received"] as const).map((status) => (
          <Button
            key={status}
            onClick={() => setFilterStatus(status)}
            variant={filterStatus === status ? "default" : "outline"}
            className={`capitalize text-xs md:text-sm ${filterStatus === status ? "bg-accent text-accent-foreground" : "border-2"}`}
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Receipts Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Receipts ({filteredReceipts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Receipt #</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Supplier</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground hidden sm:table-cell">
                    Date
                  </th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground hidden md:table-cell">
                    Items
                  </th>
                  <th className="text-right py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Total</th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Status</th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-2 md:py-3 px-2 md:px-4 text-foreground font-medium text-xs md:text-sm">
                      {receipt.receiptNumber}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground text-xs md:text-sm truncate">
                      {receipt.supplier}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground hidden sm:table-cell text-xs">
                      {receipt.date}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center font-semibold hidden md:table-cell">
                      {receipt.items}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-right text-foreground font-semibold">
                      ${receipt.total.toFixed(2)}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                      <span
                        className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(receipt.status)}`}
                      >
                        {receipt.status}
                      </span>
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                      <div className="flex gap-1 md:gap-2 justify-center flex-wrap">
                        <button className="p-1 hover:bg-primary/10 rounded transition-colors" title="View">
                          <Eye size={16} className="text-primary" />
                        </button>
                        <button
                          onClick={() => handleDownload(receipt)}
                          className="p-1 hover:bg-primary/10 rounded transition-colors"
                          title="Download"
                        >
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
