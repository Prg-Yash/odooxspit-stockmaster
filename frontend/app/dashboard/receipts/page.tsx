"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Receipt, Search, Download, Eye, Calendar, Package } from "lucide-react"
import Link from "next/link"
import { ReceiptGenerateDialog } from "@/components/dialogs/receipt-generate-dialog"

interface ReceiptItem {
  id: string
  receiptNumber: string
  date: string
  warehouse: string
  vendor: string
  items: number
  totalQuantity: number
  status: "completed" | "pending" | "processing"
  createdBy: string
}

const mockReceipts: ReceiptItem[] = [
  {
    id: "1",
    receiptNumber: "RCP-2024-001",
    date: "2024-01-15",
    warehouse: "Main Warehouse",
    vendor: "Tech Supplies Inc.",
    items: 5,
    totalQuantity: 150,
    status: "completed",
    createdBy: "John Doe"
  },
  {
    id: "2",
    receiptNumber: "RCP-2024-002",
    date: "2024-01-16",
    warehouse: "Secondary Warehouse",
    vendor: "Office Depot",
    items: 3,
    totalQuantity: 75,
    status: "completed",
    createdBy: "Jane Smith"
  },
  {
    id: "3",
    receiptNumber: "RCP-2024-003",
    date: "2024-01-17",
    warehouse: "Main Warehouse",
    vendor: "Global Supplies Co.",
    items: 8,
    totalQuantity: 320,
    status: "processing",
    createdBy: "Mike Johnson"
  },
  {
    id: "4",
    receiptNumber: "RCP-2024-004",
    date: "2024-01-18",
    warehouse: "Distribution Center",
    vendor: "Quick Ship Ltd.",
    items: 12,
    totalQuantity: 500,
    status: "pending",
    createdBy: "Sarah Williams"
  }
]

export default function ReceiptsPage() {
  const [receipts] = useState<ReceiptItem[]>(mockReceipts)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredReceipts = receipts.filter(receipt =>
    receipt.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    receipt.warehouse.toLowerCase().includes(searchQuery.toLowerCase()) ||
    receipt.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    receipt.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default"
      case "processing": return "secondary"
      case "pending": return "outline"
      default: return "outline"
    }
  }

  return (
    <div className="w-full">
      <div className="max-w-full space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 shrink-0" />
              <span className="truncate">Receipts</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              View and manage all warehouse receipts
            </p>
          </div>

          <div className="shrink-0">
            <ReceiptGenerateDialog />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search receipts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardDescription className="text-xs sm:text-sm">Total Receipts</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">{receipts.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardDescription className="text-xs sm:text-sm">Completed</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">
                {receipts.filter(r => r.status === "completed").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardDescription className="text-xs sm:text-sm">Processing</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">
                {receipts.filter(r => r.status === "processing").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardDescription className="text-xs sm:text-sm">Total Items</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">
                {receipts.reduce((sum, r) => sum + r.totalQuantity, 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Desktop Table View */}
        <Card className="hidden lg:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Receipt #</TableHead>
                    <TableHead className="min-w-[110px]">Date</TableHead>
                    <TableHead className="min-w-[150px]">Warehouse</TableHead>
                    <TableHead className="min-w-[150px]">Vendor</TableHead>
                    <TableHead className="min-w-[60px]">Items</TableHead>
                    <TableHead className="min-w-[80px]">Quantity</TableHead>
                    <TableHead className="min-w-[120px]">Created By</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium whitespace-nowrap">{receipt.receiptNumber}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                          {receipt.date}
                        </div>
                      </TableCell>
                      <TableCell>{receipt.warehouse}</TableCell>
                      <TableCell>{receipt.vendor}</TableCell>
                      <TableCell>{receipt.items}</TableCell>
                      <TableCell>{receipt.totalQuantity}</TableCell>
                      <TableCell>{receipt.createdBy}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(receipt.status)} className="whitespace-nowrap">
                          {receipt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-4">
          {filteredReceipts.map((receipt) => (
            <Card key={receipt.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg truncate">{receipt.receiptNumber}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span className="text-xs">{receipt.date}</span>
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(receipt.status)} className="shrink-0 text-xs">
                    {receipt.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Warehouse</p>
                    <p className="font-medium text-sm truncate">{receipt.warehouse}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Vendor</p>
                    <p className="font-medium text-sm truncate">{receipt.vendor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Items</p>
                    <p className="font-medium text-sm">{receipt.items}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-medium text-sm">{receipt.totalQuantity}</p>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <p className="text-xs text-muted-foreground">Created By</p>
                    <p className="font-medium text-sm truncate">{receipt.createdBy}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Eye className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Download className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReceipts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No receipts found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
