"use client"

import { CreateProductPage } from "@/components/products/create-product-page"
import { useEffect, useState } from "react"
import { getWarehouses } from "@/lib/api/warehouse"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

export default function CreateProduct() {
  const router = useRouter()
  const [warehouseId, setWarehouseId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWarehouse() {
      try {
        const response = await getWarehouses()
        if (response.success && response.data?.length) {
          setWarehouseId(response.data[0].id)
        } else {
          setError("No warehouse found. Please create a warehouse first.")
        }
      } catch (err: any) {
        console.error("Error fetching warehouse:", err)
        setError(err.message || "Failed to load warehouse")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWarehouse()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !warehouseId) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Warehouse not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return <CreateProductPage warehouseId={warehouseId} />
}
