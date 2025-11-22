"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createProduct, type Product } from "@/lib/api/product"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CreateProductPageProps {
  warehouseId: string
}

export function CreateProductPage({ warehouseId }: CreateProductPageProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categoryId: "",
    price: "",
    reorderLevel: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.sku) {
      toast.error("Product name and SKU are required")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await createProduct(warehouseId, {
        name: formData.name,
        sku: formData.sku,
        description: formData.description || undefined,
        categoryId: formData.categoryId || undefined,
        reorderLevel: formData.reorderLevel ? Number.parseInt(formData.reorderLevel) : 0,
        price: formData.price ? Number.parseFloat(formData.price) : undefined,
      })

      if (response.success) {
        toast.success("Product created successfully")
        router.push("/dashboard/products")
      } else {
        throw new Error(response.message || "Failed to create product")
      }
    } catch (error: any) {
      console.error("Error creating product:", error)
      toast.error(error.message || "Failed to create product")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <Button
        variant="outline"
        className="gap-2 border-2 w-full sm:w-auto bg-transparent"
        onClick={() => router.push("/dashboard/products")}
      >
        <ArrowLeft size={18} /> Back to Products
      </Button>

      <Card className="border-2 max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Create New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
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
                <Label htmlFor="sku">SKU *</Label>
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
                <Label htmlFor="categoryId">Category ID (optional)</Label>
                <Input
                  id="categoryId"
                  placeholder="Enter category ID"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
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
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  placeholder="Enter reorder level"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                  className="border-2"
                  min="0"
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
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 flex-1 sm:flex-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-2 flex-1 sm:flex-none bg-transparent"
                onClick={() => router.push("/dashboard/products")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
