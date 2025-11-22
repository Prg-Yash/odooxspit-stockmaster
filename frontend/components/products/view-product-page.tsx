"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, Calendar, DollarSign, Warehouse, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getProduct, type Product } from "@/lib/api/product"
import { getProductMovements, type StockMovement } from "@/lib/api/move-history"
import { useRouter } from "next/navigation"

interface ViewProductPageProps {
  productId: string
  warehouseId: string
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-semibold text-foreground ${className}`}>{children}</label>
}

export function ViewProductPage({ productId, warehouseId }: ViewProductPageProps) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProductData() {
      try {
        setIsLoading(true)
        setError(null)

        const productResponse = await getProduct(productId)
        if (!productResponse.success || !productResponse.data) {
          throw new Error(productResponse.message || "Failed to fetch product")
        }
        setProduct(productResponse.data)

        try {
          const movementsResponse = await getProductMovements(warehouseId, productId)
          if (movementsResponse.success && movementsResponse.data) {
            setMovements(movementsResponse.data)
          }
        } catch (err) {
          console.warn("Failed to fetch product movements:", err)
        }
      } catch (err: any) {
        console.error("Error fetching product:", err)
        setError(err.message || "Failed to load product")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductData()
  }, [productId, warehouseId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Product not found"}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.push("/dashboard/products")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>
    )
  }

  const totalStock = product.stockLevels?.reduce((sum, level) => sum + level.quantity, 0) || 0
  const isLowStock = product.reorderLevel > 0 && totalStock <= product.reorderLevel

  const formatMovementType = (type: string) => type.replace(/_/g, ' ')
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <Button variant="outline" className="gap-2 border-2 w-full sm:w-auto text-sm md:text-base bg-transparent" onClick={() => router.push("/dashboard/products")}>
        <ArrowLeft size={18} /> Back to Products
      </Button>

      <Card className="border-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg md:text-xl">{product.name}</CardTitle>
          <div className="flex gap-2">
            {isLowStock && <Badge variant="destructive">Low Stock</Badge>}
            {product.isActive ? <Badge variant="default" className="bg-green-500">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 p-3 md:p-4 bg-secondary/30 rounded-lg">
                <Package className="text-accent shrink-0" size={20} />
                <div>
                  <p className="text-xs text-muted-foreground">SKU</p>
                  <p className="text-base md:text-lg font-semibold">{product.sku}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 md:p-4 bg-secondary/30 rounded-lg">
                <DollarSign className="text-chart-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-base md:text-lg font-semibold">{product.price ? `$${product.price.toFixed(2)}` : "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 md:p-4 bg-secondary/30 rounded-lg">
                <Warehouse className={`shrink-0 ${isLowStock ? 'text-destructive' : 'text-primary'}`} size={20} />
                <div>
                  <p className="text-xs text-muted-foreground">Total Stock</p>
                  <p className={`text-base md:text-lg font-semibold ${isLowStock ? 'text-destructive' : ''}`}>{totalStock} units</p>
                  {product.reorderLevel > 0 && <p className="text-xs text-muted-foreground">Reorder at: {product.reorderLevel}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 md:p-4 bg-secondary/30 rounded-lg">
                <Calendar className="text-muted-foreground shrink-0" size={20} />
                <div>
                  <p className="text-xs text-muted-foreground">Created On</p>
                  <p className="text-base md:text-lg font-semibold">{new Date(product.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div>
                <Label>Category</Label>
                <p className="text-foreground mt-1 text-sm md:text-base">{product.category?.name || "N/A"}</p>
              </div>
              <div>
                <Label>Warehouse</Label>
                <p className="text-foreground mt-1 text-sm md:text-base">{product.warehouse?.name || "N/A"}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-foreground mt-1 text-xs md:text-sm leading-relaxed">{product.description || "No description provided"}</p>
              </div>
              {product.stockLevels && product.stockLevels.length > 0 && (
                <div>
                  <Label>Stock by Location</Label>
                  <div className="mt-2 space-y-1">
                    {product.stockLevels.map((level) => (
                      <div key={level.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{level.location?.name || "Unknown"}</span>
                        <span className="font-semibold">{level.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Stock Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No stock movements recorded yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Type</th>
                    <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Quantity</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Location</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Date</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground hidden sm:table-cell">Notes</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground hidden md:table-cell">User</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => (
                    <tr key={movement.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-2 md:py-3 px-2 md:px-4 text-foreground">
                        <Badge variant={movement.type === 'IN' ? 'default' : movement.type === 'OUT' ? 'destructive' : 'secondary'} className="text-xs">
                          {formatMovementType(movement.type)}
                        </Badge>
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-center font-semibold">
                        <span className={movement.type === 'IN' ? 'text-green-600' : movement.type === 'OUT' ? 'text-red-600' : ''}>
                          {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : ''}{movement.quantity}
                        </span>
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground text-xs md:text-sm">{movement.location?.name || "N/A"}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground text-xs md:text-sm">{formatDate(movement.createdAt)}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground hidden sm:table-cell text-xs">{movement.notes || "—"}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground hidden md:table-cell text-xs">{movement.user?.name || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap">
        <Button className="bg-accent hover:bg-accent/90 flex-1 sm:flex-none text-sm md:text-base" onClick={() => router.push(`/dashboard/products/edit/${productId}`)}>
          Edit Product
        </Button>
        <Button variant="outline" className="flex-1 sm:flex-none text-sm md:text-base" onClick={() => router.push("/dashboard/products")}>
          Back to Products
        </Button>
      </div>
    </div>
  )
}
