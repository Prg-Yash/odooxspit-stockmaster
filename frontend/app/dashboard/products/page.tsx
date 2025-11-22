"use client"

import { useEffect, useState } from "react"
import { ProductsListPage } from "@/components/products/products-list-page"
import { useRouter } from "next/navigation"
import { getProducts, deleteProduct, type Product } from "@/lib/api/product"
import { getWarehouses } from "@/lib/api/warehouse"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warehouseId, setWarehouseId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch user's warehouse and products
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        // First, get user's warehouses
        const warehousesResponse = await getWarehouses()

        if (!warehousesResponse.success || !warehousesResponse.data?.length) {
          setError("No warehouse found. Please create or join a warehouse first.")
          setIsLoading(false)
          return
        }

        // Use the first warehouse
        const warehouse = warehousesResponse.data[0]
        setWarehouseId(warehouse.id)

        // Fetch products for this warehouse
        const productsResponse = await getProducts(warehouse.id, {
          includeInactive: true
        })

        if (productsResponse.success && productsResponse.data) {
          // API returns { success: true, data: Product[] }
          setProducts(productsResponse.data)
        } else {
          throw new Error(productsResponse.message || "Failed to fetch products")
        }
      } catch (err: any) {
        console.error("Error fetching products:", err)

        if (err.status === 401) {
          setError("Authentication required. Please log in again.")
          // Redirect to login after a delay
          setTimeout(() => {
            router.push("/login")
          }, 2000)
        } else if (err.status === 403) {
          setError("You don't have permission to view products in this warehouse.")
        } else {
          setError(err.message || "Failed to load products. Please try again.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, refreshKey])

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return
    }

    try {
      const response = await deleteProduct(productId)

      if (response.success) {
        toast.success("Product deleted successfully")
        // Refresh the products list
        setRefreshKey(prev => prev + 1)
      } else {
        throw new Error(response.message || "Failed to delete product")
      }
    } catch (err: any) {
      console.error("Error deleting product:", err)

      if (err.status === 403) {
        toast.error("You don't have permission to delete products. Manager role required.")
      } else {
        toast.error(err.message || "Failed to delete product")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {error && !error.includes("Authentication") && (
          <div className="flex justify-end">
            <button
              onClick={() => router.push("/dashboard/products/create")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Add Product
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <ProductsListPage
      products={products}
      warehouseId={warehouseId || ""}
      onEditProduct={(id) => router.push(`/dashboard/products/edit/${id}`)}
      onViewProduct={(id) => router.push(`/dashboard/products/view/${id}`)}
      onDeleteProduct={handleDeleteProduct}
      onRefresh={() => setRefreshKey(prev => prev + 1)}
      onCreateProduct={() => router.push("/dashboard/products/create")}
    />
  )
}
