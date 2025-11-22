"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import type { Product } from "@/app/page"

interface EditProductPageProps {
  productId: string
  products: Product[]
  onProductUpdate: (product: Product) => void
}

export function EditProductPage({ productId, products, onProductUpdate }: EditProductPageProps) {
  const product = products.find((p) => p.id === productId)

  const [formData, setFormData] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    category: product?.category || "",
    price: product?.price.toString() || "",
    quantity: product?.quantity.toString() || "",
    description: product?.description || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (product && formData.name && formData.sku) {
      const updatedProduct: Product = {
        ...product,
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        price: Number.parseFloat(formData.price),
        quantity: Number.parseInt(formData.quantity),
        description: formData.description,
      }
      onProductUpdate(updatedProduct)
    }
  }

  if (!product) return <div>Product not found</div>

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <Button variant="outline" className="gap-2 border-2 w-full sm:w-auto bg-transparent">
        <ArrowLeft size={18} /> Back to Products
      </Button>

      <Card className="border-2 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Edit Product: {product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-2"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="Enter SKU"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="border-2"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="Enter category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="border-2"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="border-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-2 resize-none"
                rows={4}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-accent hover:bg-accent/90 flex-1 sm:flex-none">
                Update Product
              </Button>
              <Button type="button" variant="outline" className="border-2 flex-1 sm:flex-none bg-transparent">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
