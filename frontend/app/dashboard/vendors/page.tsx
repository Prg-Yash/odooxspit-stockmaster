"use client"

import { useState, useEffect } from "react"
import { VendorsPage } from "@/components/vendors/vendors-page"
import { api } from "@/lib/api-client"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Vendor } from "@/types"

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVendors = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await api.get<Vendor[]>("/vendors")
      setVendors(response || [])
    } catch (err: any) {
      console.error("Error fetching vendors:", err)
      setError(err.message || "Failed to load vendors")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading vendors...</p>
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
      </div>
    )
  }

  return <VendorsPage vendors={vendors} setVendors={setVendors} onRefresh={fetchVendors} />
}
