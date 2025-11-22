"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Package, AlertTriangle, Warehouse, Activity } from "lucide-react"
import type { MoveRecord } from "@/app/page"

interface DashboardOverviewProps {
  moveRecords: MoveRecord[]
}

const inventoryData = [
  { name: "Jan", value: 2400, capacity: 2400 },
  { name: "Feb", value: 1398, capacity: 2400 },
  { name: "Mar", value: 9800, capacity: 2400 },
  { name: "Apr", value: 3908, capacity: 2400 },
  { name: "May", value: 4800, capacity: 2400 },
  { name: "Jun", value: 3800, capacity: 2400 },
]

const movementData = [
  { name: "Week 1", in: 400, out: 240 },
  { name: "Week 2", in: 300, out: 221 },
  { name: "Week 3", in: 200, out: 229 },
  { name: "Week 4", in: 278, out: 200 },
  { name: "Week 5", in: 189, out: 229 },
]

export function DashboardOverview({ moveRecords }: DashboardOverviewProps) {
  const recentMoves = moveRecords.slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-accent">
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              <Package className="text-accent" size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-foreground">1,284</div>
            <p className="text-xs text-muted-foreground mt-1 md:mt-2">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-accent">
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
              <AlertTriangle className="text-destructive" size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-destructive">23</div>
            <p className="text-xs text-muted-foreground mt-1 md:mt-2">Require attention</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-accent">
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total Warehouses</CardTitle>
              <Warehouse className="text-primary" size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-foreground">8</div>
            <p className="text-xs text-muted-foreground mt-1 md:mt-2">Across 3 regions</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-accent">
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Recent Moves</CardTitle>
              <Activity className="text-chart-1" size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-foreground">{moveRecords.length}</div>
            <p className="text-xs text-muted-foreground mt-1 md:mt-2">Total stock movements</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Inventory Levels</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={300} minWidth={250}>
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "2px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Stock Movement</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={300} minWidth={250}>
              <LineChart data={movementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "2px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="in"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-1)" }}
                />
                <Line
                  type="monotone"
                  dataKey="out"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={{ fill: "var(--chart-2)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Moves Preview */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Recent Stock Movements</CardTitle>
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
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Qty</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentMoves.map((move) => (
                  <tr key={move.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-2 md:py-3 px-2 md:px-4 text-foreground font-medium truncate">
                      {move.productName}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground hidden sm:table-cell text-xs">
                      {move.moveType.replace(/-/g, " ")}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center font-semibold">{move.quantity}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground hidden md:table-cell text-xs">
                      {move.date}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                      <span
                        className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs font-medium border ${
                          move.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
                            : move.status === "in-transit"
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "bg-chart-1/20 text-chart-1 border-chart-1/30"
                        }`}
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
