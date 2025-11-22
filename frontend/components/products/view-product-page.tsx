"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Calendar, DollarSign, Warehouse } from "lucide-react"
import type { Product } from "@/app/page"

interface ViewProductPageProps {
  productId: string
  products: Product[]
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-semibold text-foreground ${className}`}>{children}</label>
}

export function ViewProductPage({ productId, products }: ViewProductPageProps) {
  const product = products.find((p) => p.id === productId)

  if (!product) return <div className="text-center py-8">Product not found</div>

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <Button variant="outline" className="gap-2 border-2 w-full sm:w-auto text-sm md:text-base bg-transparent">
        <ArrowLeft size={18} /> Back to Products
      </Button>

      {/* Product Details */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 p-3 md:p-4 bg-secondary/30 rounded-lg">
                <Package className="text-accent flex-shrink-0" size={20} />
                <div>
                  <p className="text-xs text-muted-foreground">SKU</p>
                  <p className="text-base md:text-lg font-semibold">{product.sku}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 md:p-4 bg-secondary/30 rounded-lg">
                <DollarSign className="text-chart-1 flex-shrink-0" size={20} />
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-base md:text-lg font-semibold">${product.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 md:p-4 bg-secondary/30 rounded-lg">
                <Warehouse className="text-primary flex-shrink-0" size={20} />
                <div>
                  <p className="text-xs text-muted-foreground">Stock Quantity</p>
                  <p className="text-base md:text-lg font-semibold">{product.quantity} units</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 md:p-4 bg-secondary/30 rounded-lg">
                <Calendar className="text-muted-foreground flex-shrink-0" size={20} />
                <div>
                  <p className="text-xs text-muted-foreground">Created On</p>
                  <p className="text-base md:text-lg font-semibold">{product.createdAt}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div>
                <Label>Category</Label>
                <p className="text-foreground mt-1 text-sm md:text-base">{product.category || "N/A"}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-foreground mt-1 text-xs md:text-sm leading-relaxed">
                  {product.description || "No description provided"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product History */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Stock History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Action</th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Previous</th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Current</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Date</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground hidden sm:table-cell">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {product.history.map((record) => (
                  <tr key={record.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-2 md:py-3 px-2 md:px-4 text-foreground font-medium capitalize text-xs md:text-sm">
                      {record.action.replace(/_/g, " ")}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center font-semibold text-sm">
                      {record.previousQuantity}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center font-semibold text-primary text-sm">
                      {record.quantity}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground text-xs md:text-sm">
                      {record.date}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground hidden sm:table-cell text-xs">
                      {record.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap">
        <Button className="bg-accent hover:bg-accent/90 flex-1 sm:flex-none text-sm md:text-base">Edit Product</Button>
      </div>
    </div>
  )
}
