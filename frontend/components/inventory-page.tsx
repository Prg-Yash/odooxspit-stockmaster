"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { InventoryUpdateDialog } from "@/components/dialogs/inventory-update-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Loader2, Package } from "lucide-react"
import { getStockLevels, type StockLevel } from "@/lib/api/stock"
import { getProducts, type Product } from "@/lib/api/product"
import { getWarehouseLocations, type Location } from "@/lib/api/warehouse"
import { toast } from "sonner"

interface InventoryItem {
  productId: string
  productName: string
  sku: string
  description?: string
  reorderLevel: number
  maxStockLevel?: number
  isActive: boolean
  locations: {
    locationId: string
    locationName: string
    quantity: number
    status: "low" | "critical" | "normal" | "excess" | "out-of-stock"
  }[]
  totalQuantity: number
  overallStatus: "low" | "critical" | "normal" | "excess" | "out-of-stock"
}

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [warehouseId, setWarehouseId] = useState<string | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  const [filterStatus, setFilterStatus] = useState<"all" | InventoryItem["status"]>("all")

  useEffect(() => {
    fetchInventory()
  }, [])

  async function fetchInventory() {
    try {
      setLoading(true)
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        toast.error("Please login to view inventory")
        return
      }

      let warehouseId = localStorage.getItem("selectedWarehouseId")

      if (!warehouseId) {
        const { getWarehouses } = await import("@/lib/api/warehouse")
        const warehousesResponse = await getWarehouses()
        if (warehousesResponse.success && warehousesResponse.data && warehousesResponse.data.length > 0) {
          warehouseId = warehousesResponse.data[0].id
          localStorage.setItem("selectedWarehouseId", warehouseId)
        } else {
          toast.error("No warehouse found. Please create or join a warehouse first.")
          setLoading(false)
          return
        }
      }

      setWarehouseId(warehouseId)

      // Fetch all products, stock levels, and locations in parallel
      const [productsResponse, stockResponse, locationsResponse] = await Promise.all([
        getProducts(warehouseId, { includeInactive: true }),
        getStockLevels(warehouseId, { includeZero: true }),
        getWarehouseLocations(warehouseId)
      ])

      if (!productsResponse.success || !stockResponse.success || !locationsResponse.success) {
        throw new Error("Failed to fetch inventory data")
      }

      const products = productsResponse.data || []
      const stockLevels = stockResponse.data || []
      const locationsList = locationsResponse.data || []

      setLocations(locationsList)

      // Create a map of stock levels by product and location
      const stockMap = new Map<string, Map<string, number>>()
      stockLevels.forEach((stock: StockLevel) => {
        if (!stockMap.has(stock.productId)) {
          stockMap.set(stock.productId, new Map())
        }
        stockMap.get(stock.productId)!.set(stock.locationId, stock.quantity)
      })

      // Build inventory items with all products
      const inventoryItems: InventoryItem[] = products.map((product: Product) => {
        const productStockMap = stockMap.get(product.id) || new Map()
        const reorderLevel = product.reorderLevel || 10
        const maxStockLevel = product.maxStockLevel

        // Get stock for each location
        const locationStocks = locationsList.map((location: Location) => {
          const quantity = productStockMap.get(location.id) || 0

          let status: "low" | "critical" | "normal" | "excess" | "out-of-stock"
          if (quantity === 0) {
            status = "out-of-stock"
          } else if (quantity < reorderLevel * 0.5) {
            status = "critical"
          } else if (quantity < reorderLevel) {
            status = "low"
          } else if (maxStockLevel && quantity > maxStockLevel) {
            status = "excess"
          } else {
            status = "normal"
          }

          return {
            locationId: location.id,
            locationName: location.name,
            quantity,
            status
          }
        })

        const totalQuantity = locationStocks.reduce((sum, loc) => sum + loc.quantity, 0)

        // Overall status based on total quantity
        let overallStatus: "low" | "critical" | "normal" | "excess" | "out-of-stock"
        if (totalQuantity === 0) {
          overallStatus = "out-of-stock"
        } else if (totalQuantity < reorderLevel * 0.5) {
          overallStatus = "critical"
        } else if (totalQuantity < reorderLevel) {
          overallStatus = "low"
        } else if (maxStockLevel && totalQuantity > maxStockLevel) {
          overallStatus = "excess"
        } else {
          overallStatus = "normal"
        }

        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          description: product.description,
          reorderLevel,
          maxStockLevel,
          isActive: product.isActive,
          locations: locationStocks,
          totalQuantity,
          overallStatus
        }
      })

      setItems(inventoryItems)
    } catch (error: any) {
      console.error("Failed to fetch inventory:", error)
      toast.error(error.message || "Failed to load inventory")
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter((item) => {
    if (filterStatus === "all") return true
    return item.overallStatus === filterStatus
  })

  const getStatusColor = (status: "low" | "critical" | "normal" | "excess" | "out-of-stock") => {
    switch (status) {
      case "out-of-stock":
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30"
      case "critical":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "low":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-500 border-yellow-500/30"
      case "normal":
        return "bg-green-500/20 text-green-700 dark:text-green-500 border-green-500/30"
      case "excess":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-500 border-blue-500/30"
      default:
        return ""
    }
  }

  const criticalCount = items.filter((i) => i.overallStatus === "critical" || i.overallStatus === "out-of-stock").length

  function toggleProductExpansion(productId: string) {
    setExpandedProducts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Alert Banner for Low Stock */}
      {criticalCount > 0 && (
        <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-3 md:p-4 flex items-start gap-3">
          <AlertTriangle className="text-destructive shrink-0 mt-0.5 md:mt-1" size={20} />
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
          {(["all", "normal", "low", "critical", "out-of-stock", "excess"] as const).map((status) => (
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
        <InventoryUpdateDialog onSuccess={fetchInventory} warehouseId={warehouseId || ""} products={items} locations={locations} />
      </div>

      {/* Inventory Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Inventory Status ({filteredItems.length} Products)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground w-8"></th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Product</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">SKU</th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Total Stock</th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground hidden lg:table-cell">
                    Reorder / Max
                  </th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <>
                    <tr
                      key={item.productId}
                      className="border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => toggleProductExpansion(item.productId)}
                    >
                      <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-foreground font-medium text-xs md:text-sm">
                        <div className="flex flex-col">
                          <span>{item.productName}</span>
                          {!item.isActive && (
                            <span className="text-xs text-red-500">(Inactive)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground text-xs md:text-sm">{item.sku}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-center font-semibold text-base">{item.totalQuantity}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-center text-muted-foreground text-xs hidden lg:table-cell">
                        {item.reorderLevel} / {item.maxStockLevel || "—"}
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                        <span
                          className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(item.overallStatus)}`}
                        >
                          {item.overallStatus === "out-of-stock" ? "Out" : item.overallStatus}
                        </span>
                      </td>
                    </tr>
                    {expandedProducts.has(item.productId) && (
                      <tr key={`${item.productId}-details`} className="bg-secondary/20">
                        <td colSpan={6} className="py-3 px-6">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Stock by Location:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {item.locations.map((loc) => (
                                <div
                                  key={loc.locationId}
                                  className="flex justify-between items-center p-2 bg-background rounded border"
                                >
                                  <span className="text-sm font-medium">{loc.locationName}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold">{loc.quantity}</span>
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-full text-xs border ${getStatusColor(loc.status)}`}
                                    >
                                      {loc.status === "out-of-stock" ? "Out" : loc.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
