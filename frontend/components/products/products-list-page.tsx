"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Edit2, Trash2, Search, Eye } from "lucide-react"
import type { Product } from "@/app/page"

interface ProductsListPageProps {
  products: Product[]
  onEditProduct: (id: string) => void
  onViewProduct: (id: string) => void
}

export function ProductsListPage({ products, onEditProduct, onViewProduct }: ProductsListPageProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 sm:flex-none sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-2"
          />
        </div>
        <Button
          onClick={() => (window.location.pathname = "/")}
          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 whitespace-nowrap w-full sm:w-auto"
        >
          <Plus size={18} /> Create Product
        </Button>
      </div>

      {/* Products Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Product</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">SKU</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-right py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground hidden lg:table-cell">
                    Price
                  </th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Qty</th>
                  <th className="text-center py-2 md:py-3 px-2 md:px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-2 md:py-3 px-2 md:px-4 text-foreground font-medium truncate">{product.name}</td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground text-xs md:text-sm">
                      {product.sku}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-muted-foreground hidden md:table-cell text-xs">
                      {product.category}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-right text-foreground hidden lg:table-cell">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                      <span className="inline-block px-2 md:px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                      <div className="flex gap-1 justify-center flex-wrap">
                        <button
                          onClick={() => onViewProduct(product.id)}
                          className="p-1 hover:bg-primary/10 rounded transition-colors"
                          title="View"
                        >
                          <Eye size={16} className="text-primary" />
                        </button>
                        <button
                          onClick={() => onEditProduct(product.id)}
                          className="p-1 hover:bg-primary/10 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} className="text-primary" />
                        </button>
                        <button className="p-1 hover:bg-destructive/10 rounded transition-colors" title="Delete">
                          <Trash2 size={16} className="text-destructive" />
                        </button>
                      </div>
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
