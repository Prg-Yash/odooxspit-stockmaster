"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ArrowRight, GripHorizontal } from "lucide-react"
import type { MoveRecord, Product, Warehouse, Vendor } from "@/app/page"

interface MovesPageProps {
  moveRecords: MoveRecord[]
  setMoveRecords: (records: MoveRecord[]) => void
  products: Product[]
  warehouses: Warehouse[]
  vendors: Vendor[]
}

export function MovesPage({ moveRecords, setMoveRecords, products, warehouses, vendors }: MovesPageProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | MoveRecord["status"]>("all")
  const [showForm, setShowForm] = useState(false)
  const [draggedItem, setDraggedItem] = useState<MoveRecord | null>(null)
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    fromLocation: "",
    toLocation: "",
    moveType: "in-warehouse" as const,
    vendorId: "",
  })

  const filteredMoves = moveRecords.filter((move) => (filterStatus === "all" ? true : move.status === filterStatus))

  const getStatusColor = (status: MoveRecord["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
      case "in-transit":
        return "bg-primary/20 text-primary border-primary/30"
      case "completed":
        return "bg-chart-1/20 text-chart-1 border-chart-1/30"
      default:
        return ""
    }
  }

  const handleDragStart = (move: MoveRecord) => {
    setDraggedItem(move)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (newStatus: MoveRecord["status"]) => {
    if (draggedItem) {
      setMoveRecords(moveRecords.map((move) => (move.id === draggedItem.id ? { ...move, status: newStatus } : move)))
      setDraggedItem(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Kanban View */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Move History - Interactive Kanban</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["pending", "in-transit", "completed"] as const).map((status) => {
            const statusMoves = moveRecords.filter((m) => m.status === status)
            const statusLabels = {
              pending: "Pending",
              "in-transit": "In Transit",
              completed: "Completed",
            }
            return (
              <Card
                key={status}
                className="border-2 bg-secondary/30 min-h-96 md:min-h-[500px]"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(status)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        status === "pending" ? "bg-yellow-500" : status === "in-transit" ? "bg-primary" : "bg-chart-1"
                      }`}
                    />
                    {statusLabels[status]} ({statusMoves.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex flex-col">
                  {statusMoves.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">No moves</div>
                  ) : (
                    statusMoves.map((move) => (
                      <div
                        key={move.id}
                        draggable
                        onDragStart={() => handleDragStart(move)}
                        className="p-3 bg-card rounded-lg border border-border hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing animate-scale-in"
                      >
                        <div className="flex items-start gap-2">
                          <GripHorizontal size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{move.productName}</p>
                            <p className="text-xs text-muted-foreground mb-2">{move.sku}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                              <span className="truncate">{move.fromLocation}</span>
                              <ArrowRight size={12} className="flex-shrink-0" />
                              <span className="truncate">{move.toLocation}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-foreground">Qty: {move.quantity}</span>
                              <span className="text-xs text-muted-foreground">{move.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "in-transit", "completed"] as const).map((status) => (
            <Button
              key={status}
              onClick={() => setFilterStatus(status)}
              variant={filterStatus === status ? "default" : "outline"}
              className={`capitalize text-xs md:text-sm ${filterStatus === status ? "bg-accent text-accent-foreground" : "border-2"}`}
            >
              {status === "in-transit" ? "In Transit" : status}
            </Button>
          ))}
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 whitespace-nowrap w-full md:w-auto"
        >
          <Plus size={18} /> Create Move
        </Button>
      </div>

      {/* Moves Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Move History ({filteredMoves.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Product</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground hidden sm:table-cell">
                    Type
                  </th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">From</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">To</th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Qty</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMoves.map((move) => (
                  <tr key={move.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-2 md:py-3 px-2 md:px-4 text-foreground font-medium text-xs md:text-sm truncate">
                      {move.productName}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground hidden sm:table-cell text-xs">
                      {move.moveType.replace(/-/g, " ")}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground text-xs md:text-sm">
                      {move.fromLocation}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground text-xs md:text-sm">
                      {move.toLocation}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center font-semibold">{move.quantity}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground hidden lg:table-cell text-xs">
                      {move.date}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                      <span
                        className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(move.status)}`}
                      >
                        {move.status === "in-transit" ? "In Transit" : move.status}
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
