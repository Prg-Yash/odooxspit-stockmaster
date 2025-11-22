"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Plus } from "lucide-react"
import type { Product, Warehouse } from "@/app/page"

interface InventoryItem {
  id: string
  productName: string
  sku: string
  warehouse: string
  quantity: number
  minStock: number
  maxStock: number
  status: "low" | "critical" | "normal" | "excess"
}

interface InventoryPageProps {
  products: Product[]
  warehouses: Warehouse[]
}

export function InventoryPage({ products, warehouses }: InventoryPageProps) {
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: "1",
      productName: "Laptop Pro",
      sku: "LP-001",
      warehouse: "Main Warehouse",
      quantity: 45,
      minStock: 10,
      maxStock: 100,
      status: "normal",
    },
    {
      id: "2",
      productName: "USB Cable",
      sku: "UC-001",
      warehouse: "Main Warehouse",
      quantity: 8,
      minStock: 20,
      maxStock: 500,
      status: "critical",
    },
    {
      id: "3",
      productName: 'Monitor 27"',
      sku: "MON-001",
      warehouse: "Branch Warehouse",
      quantity: 28,
      minStock: 15,
      maxStock: 50,
      status: "normal",
    },
  ])

  const [filterStatus, setFilterStatus] = useState<"all" | InventoryItem["status"]>("all")

  const filteredItems = items.filter((item) => (filterStatus === "all" ? true : item.status === filterStatus))

  const getStatusColor = (status: InventoryItem["status"]) => {
    switch (status) {
      case "critical":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "low":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
      case "normal":
        return "bg-chart-1/20 text-chart-1 border-chart-1/30"
      case "excess":
        return "bg-chart-2/20 text-chart-2 border-chart-2/30"
      default:
        return ""
    }
  }

  const criticalCount = items.filter((i) => i.status === "critical").length

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Alert Banner for Low Stock */}
      {criticalCount > 0 && (
        <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-3 md:p-4 flex items-start gap-3">
          <AlertTriangle className="text-destructive flex-shrink-0 mt-0.5 md:mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-destructive text-sm md:text-base">Low Stock Alert</h3>
            <p className="text-xs md:text-sm text-destructive/80">
              {criticalCount} item(s) are critically low and need immediate replenishment
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(["all", "normal", "low", "critical", "excess"] as const).map((status) => (
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
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 whitespace-nowrap w-full sm:w-auto text-sm md:text-base">
          <Plus size={18} /> Update Stock
        </Button>
      </div>

      {/* Inventory Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Inventory Status ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Product</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">SKU</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground hidden md:table-cell">
                    Warehouse
                  </th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Current</th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground hidden lg:table-cell">
                    Min / Max
                  </th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-2 md:py-3 px-2 md:px-4 text-foreground font-medium text-xs md:text-sm truncate">
                      {item.productName}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground text-xs md:text-sm">{item.sku}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground hidden md:table-cell text-xs">
                      {item.warehouse}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center font-semibold">{item.quantity}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center text-muted-foreground text-xs hidden lg:table-cell">
                      {item.minStock} / {item.maxStock}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                      <span
                        className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
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
