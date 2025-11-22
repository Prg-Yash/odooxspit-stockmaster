"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"
import { getProduct, updateProduct, type Product } from "@/lib/api/product"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface EditProductPageProps {
    productId: string
}

export function EditProductPage({ productId }: EditProductPageProps) {
    const router = useRouter()
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        categoryId: "",
        price: "",
        reorderLevel: "",
        description: "",
        isActive: true,
    })

    useEffect(() => {
        async function fetchProduct() {
            try {
                setIsLoading(true)
                const response = await getProduct(productId)

                if (response.success && response.data) {
                    const prod = response.data
                    setProduct(prod)
                    setFormData({
                        name: prod.name,
                        sku: prod.sku,
                        categoryId: prod.categoryId || "",
                        price: prod.price ? prod.price.toString() : "",
                        reorderLevel: prod.reorderLevel.toString(),
                        description: prod.description || "",
                        isActive: prod.isActive,
                    })
                } else {
                    throw new Error(response.message || "Failed to fetch product")
                }
            } catch (err: any) {
                console.error("Error fetching product:", err)
                setError(err.message || "Failed to load product")
            } finally {
                setIsLoading(false)
            }
        }

        fetchProduct()
    }, [productId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.sku) {
            toast.error("Product name and SKU are required")
            return
        }

        setIsSubmitting(true)

        try {
            const response = await updateProduct(productId, {
                name: formData.name,
                sku: formData.sku,
                description: formData.description || undefined,
                categoryId: formData.categoryId || undefined,
                reorderLevel: formData.reorderLevel ? Number.parseInt(formData.reorderLevel) : 0,
                price: formData.price ? Number.parseFloat(formData.price) : undefined,
                isActive: formData.isActive,
            })

            if (response.success) {
                toast.success("Product updated successfully")
                router.push("/dashboard/products")
            } else {
                throw new Error(response.message || "Failed to update product")
            }
        } catch (error: any) {
            console.error("Error updating product:", error)
            toast.error(error.message || "Failed to update product")
        } finally {
            setIsSubmitting(false)
        }
    }

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
                <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/products")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Products
                </Button>
            </div>
        )
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
                    <CardTitle className="text-lg md:text-xl">Edit Product</CardTitle>
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
                                    min="0"
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
                            <div className="space-y-2 flex items-center gap-3 pt-6">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label htmlFor="isActive" className="cursor-pointer">
                                    Active Product
                                </Label>
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
                                        Updating...
                                    </>
                                ) : (
                                    "Update Product"
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
