"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react"
import type { MoveRecord } from "@/types"

interface MoveHistoryPreviewPageProps {
  moveRecords: MoveRecord[]
}

export function MoveHistoryPreviewPage({ moveRecords }: MoveHistoryPreviewPageProps) {
  const incomingCount = moveRecords.filter((m) => m.moveType === "incoming").length
  const outgoingCount = moveRecords.filter((m) => m.moveType === "delivery").length
  const internalMoves = moveRecords.filter(
    (m) => m.moveType === "in-warehouse" || m.moveType === "warehouse-to-warehouse",
  ).length

  const statsCards = [
    { label: "Incoming Orders", value: incomingCount, icon: TrendingDown, color: "text-primary" },
    { label: "Outgoing Deliveries", value: outgoingCount, icon: TrendingUp, color: "text-chart-1" },
    { label: "Internal Movements", value: internalMoves, icon: ArrowRight, color: "text-accent" },
    { label: "Total Moves", value: moveRecords.length, icon: TrendingUp, color: "text-secondary-foreground" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card key={idx} className="border-2 hover:shadow-lg transition-all duration-300 hover:border-accent">
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <Icon className={stat.color} size={18} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Move History */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Complete Move History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {moveRecords.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No moves recorded yet</p>
            ) : (
              moveRecords.map((move) => (
                <div
                  key={move.id}
                  className="p-3 md:p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Product</p>
                      <p className="text-sm md:text-base font-semibold text-foreground">{move.productName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Movement Type</p>
                      <p className="text-sm md:text-base font-semibold text-foreground capitalize">
                        {move.moveType.replace(/-/g, " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Route</p>
                      <div className="flex items-center gap-2 text-sm md:text-base">
                        <span className="font-semibold text-foreground truncate">{move.fromLocation}</span>
                        <ArrowRight size={16} className="text-muted-foreground shrink-0" />
                        <span className="font-semibold text-foreground truncate">{move.toLocation}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Quantity</p>
                        <p className="text-sm md:text-base font-semibold text-primary">{move.quantity} units</p>
                      </div>
                      <span
                        className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs font-medium border capitalize w-fit ${
                          move.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
                            : move.status === "in-transit"
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "bg-chart-1/20 text-chart-1 border-chart-1/30"
                        }`}
                      >
                        {move.status === "in-transit" ? "In Transit" : move.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">Date: {move.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
