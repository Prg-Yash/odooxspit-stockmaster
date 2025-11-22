"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Search, Calendar, Package, ArrowRight, Clock } from "lucide-react"

interface MoveHistory {
  id: string
  timestamp: string
  product: string
  quantity: number
  fromLocation: string
  toLocation: string
  warehouse: string
  moveType: "internal" | "receipt" | "shipment"
  user: string
  status: "completed" | "in-progress"
}

const mockMoveHistory: MoveHistory[] = [
  {
    id: "1",
    timestamp: "2024-01-18 15:30",
    product: "Laptop - Dell XPS 15",
    quantity: 10,
    fromLocation: "Receiving",
    toLocation: "A-01-01",
    warehouse: "Main Warehouse",
    moveType: "receipt",
    user: "John Doe",
    status: "completed"
  },
  {
    id: "2",
    timestamp: "2024-01-18 14:15",
    product: "Monitor - LG 27\"",
    quantity: 5,
    fromLocation: "A-01-02",
    toLocation: "B-02-03",
    warehouse: "Main Warehouse",
    moveType: "internal",
    user: "Jane Smith",
    status: "completed"
  },
  {
    id: "3",
    timestamp: "2024-01-18 13:00",
    product: "Keyboard - Logitech MX Keys",
    quantity: 25,
    fromLocation: "A-02-01",
    toLocation: "Shipping",
    warehouse: "Secondary Warehouse",
    moveType: "shipment",
    user: "Mike Johnson",
    status: "in-progress"
  },
  {
    id: "4",
    timestamp: "2024-01-18 11:45",
    product: "Mouse - Logitech MX Master 3",
    quantity: 15,
    fromLocation: "Receiving",
    toLocation: "C-01-01",
    warehouse: "Distribution Center",
    moveType: "receipt",
    user: "Sarah Williams",
    status: "completed"
  },
  {
    id: "5",
    timestamp: "2024-01-18 10:30",
    product: "Headset - Sony WH-1000XM4",
    quantity: 8,
    fromLocation: "B-01-01",
    toLocation: "A-03-02",
    warehouse: "Main Warehouse",
    moveType: "internal",
    user: "John Doe",
    status: "completed"
  },
  {
    id: "6",
    timestamp: "2024-01-17 16:20",
    product: "Webcam - Logitech C920",
    quantity: 12,
    fromLocation: "C-02-01",
    toLocation: "Shipping",
    warehouse: "Main Warehouse",
    moveType: "shipment",
    user: "Jane Smith",
    status: "completed"
  }
]

export default function MoveHistoryPage() {
  const [moveHistory] = useState<MoveHistory[]>(mockMoveHistory)
  const [searchQuery, setSearchQuery] = useState("")
  const [moveTypeFilter, setMoveTypeFilter] = useState("all")
  const [warehouseFilter, setWarehouseFilter] = useState("all")

  const filteredHistory = moveHistory.filter(move => {
    const matchesSearch = 
      move.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.toLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.user.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = moveTypeFilter === "all" || move.moveType === moveTypeFilter
    const matchesWarehouse = warehouseFilter === "all" || move.warehouse === warehouseFilter

    return matchesSearch && matchesType && matchesWarehouse
  })

  const getMoveTypeColor = (type: string) => {
    switch (type) {
      case "receipt": return "default"
      case "shipment": return "secondary"
      case "internal": return "outline"
      default: return "outline"
    }
  }

  const getMoveTypeLabel = (type: string) => {
    switch (type) {
      case "receipt": return "Receipt"
      case "shipment": return "Shipment"
      case "internal": return "Internal"
      default: return type
    }
  }

  const warehouses = Array.from(new Set(moveHistory.map(m => m.warehouse)))

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <History className="h-7 w-7 sm:h-8 sm:w-8" />
            Recent Move History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View recent inventory movements and transactions
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={moveTypeFilter} onValueChange={setMoveTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="shipment">Shipment</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {warehouses.map(wh => (
                <SelectItem key={wh} value={wh}>{wh}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Today's Moves</CardDescription>
              <CardTitle className="text-3xl">
                {moveHistory.filter(m => m.timestamp.includes("2024-01-18")).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Receipts</CardDescription>
              <CardTitle className="text-3xl">
                {moveHistory.filter(m => m.moveType === "receipt").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Shipments</CardDescription>
              <CardTitle className="text-3xl">
                {moveHistory.filter(m => m.moveType === "shipment").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Internal Moves</CardDescription>
              <CardTitle className="text-3xl">
                {moveHistory.filter(m => m.moveType === "internal").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Timeline View */}
        <div className="space-y-4">
          {filteredHistory.map((move, index) => (
            <Card key={move.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Timeline Indicator */}
                  <div className="hidden sm:flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    {index < filteredHistory.length - 1 && (
                      <div className="w-0.5 h-full min-h-[40px] bg-border" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getMoveTypeColor(move.moveType)}>
                          {getMoveTypeLabel(move.moveType)}
                        </Badge>
                        {move.status === "in-progress" && (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {move.timestamp}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        by {move.user}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{move.product}</span>
                      <Badge variant="outline">{move.quantity} units</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
                      <span className="font-mono">{move.fromLocation}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-mono">{move.toLocation}</span>
                      <span className="text-muted-foreground ml-auto hidden sm:inline">
                        {move.warehouse}
                      </span>
                    </div>

                    <div className="sm:hidden text-sm text-muted-foreground">
                      {move.warehouse}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHistory.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No move history found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
