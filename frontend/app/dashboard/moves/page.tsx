"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Search, Calendar, Package, MapPin, ArrowRight } from "lucide-react"

interface Move {
  id: string
  moveNumber: string
  date: string
  product: string
  quantity: number
  fromLocation: string
  toLocation: string
  warehouse: string
  status: "completed" | "in-progress" | "pending"
  movedBy: string
}

const mockMoves: Move[] = [
  {
    id: "1",
    moveNumber: "MV-2024-001",
    date: "2024-01-15 10:30",
    product: "Laptop - Dell XPS 15",
    quantity: 25,
    fromLocation: "A-01-01",
    toLocation: "B-02-03",
    warehouse: "Main Warehouse",
    status: "completed",
    movedBy: "John Doe"
  },
  {
    id: "2",
    moveNumber: "MV-2024-002",
    date: "2024-01-15 11:45",
    product: "Monitor - LG 27\"",
    quantity: 15,
    fromLocation: "A-01-02",
    toLocation: "C-01-01",
    warehouse: "Main Warehouse",
    status: "completed",
    movedBy: "Jane Smith"
  },
  {
    id: "3",
    moveNumber: "MV-2024-003",
    date: "2024-01-16 09:15",
    product: "Keyboard - Logitech MX Keys",
    quantity: 50,
    fromLocation: "B-01-01",
    toLocation: "A-03-02",
    warehouse: "Secondary Warehouse",
    status: "in-progress",
    movedBy: "Mike Johnson"
  },
  {
    id: "4",
    moveNumber: "MV-2024-004",
    date: "2024-01-16 14:20",
    product: "Mouse - Logitech MX Master 3",
    quantity: 30,
    fromLocation: "C-02-01",
    toLocation: "A-01-03",
    warehouse: "Distribution Center",
    status: "pending",
    movedBy: "Sarah Williams"
  },
  {
    id: "5",
    moveNumber: "MV-2024-005",
    date: "2024-01-17 08:00",
    product: "Headset - Sony WH-1000XM4",
    quantity: 20,
    fromLocation: "A-02-01",
    toLocation: "B-03-01",
    warehouse: "Main Warehouse",
    status: "completed",
    movedBy: "John Doe"
  }
]

export default function MovesPage() {
  const [moves] = useState<Move[]>(mockMoves)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [warehouseFilter, setWarehouseFilter] = useState("all")

  const filteredMoves = moves.filter(move => {
    const matchesSearch =
      move.moveNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.toLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      move.movedBy.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || move.status === statusFilter
    const matchesWarehouse = warehouseFilter === "all" || move.warehouse === warehouseFilter

    return matchesSearch && matchesStatus && matchesWarehouse
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default"
      case "in-progress": return "secondary"
      case "pending": return "outline"
      default: return "outline"
    }
  }

  const warehouses = Array.from(new Set(moves.map(m => m.warehouse)))

  return (
    <div className=" px-4 sm:px-6 lg:px-8">
      <div className=" space-y-6">
        
        {/* Header */}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate flex items-center gap-2">
            <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8" />
            Stock Moves
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track all inventory movements between locations
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search moves..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by warehouse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {warehouses.map(w => (
                <SelectItem key={w} value={w}>{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardDescription>Total Moves</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">{moves.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">
                {moves.filter(m => m.status === "completed").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">
                {moves.filter(m => m.status === "in-progress").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
              <CardDescription>Total Items</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">
                {moves.reduce((s, m) => s + m.quantity, 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Desktop Table */}
        <Card className="hidden lg:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto w-full">
              <Table className=" w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Move #</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>From → To</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Moved By</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredMoves.map(move => (
                    <TableRow key={move.id}>
                      <TableCell className="font-medium">{move.moveNumber}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {move.date}
                        </div>
                      </TableCell>

                      <TableCell>{move.product}</TableCell>
                      <TableCell>{move.quantity}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono">{move.fromLocation}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono">{move.toLocation}</span>
                        </div>
                      </TableCell>

                      <TableCell>{move.warehouse}</TableCell>
                      <TableCell>{move.movedBy}</TableCell>

                      <TableCell>
                        <Badge variant={getStatusColor(move.status)}>{move.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredMoves.map(move => (
            <Card key={move.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{move.moveNumber}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {move.date}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(move.status)}>{move.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4" />
                  <span className="font-medium flex-1 truncate">{move.product}</span>
                  <Badge variant="outline" className="text-xs">{move.quantity}</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm overflow-x-auto">
                  <MapPin className="h-4 w-4" />
                  <span className="font-mono text-xs">{move.fromLocation}</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-mono text-xs">{move.toLocation}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm border-t pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Warehouse</p>
                    <p className="font-medium truncate">{move.warehouse}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Moved By</p>
                    <p className="font-medium truncate">{move.movedBy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredMoves.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No moves found</p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
