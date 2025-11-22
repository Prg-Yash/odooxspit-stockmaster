"use client"

import { ViewProductPage } from "@/components/products/view-product-page"
import { useStore } from "@/lib/store"
import { useParams } from "next/navigation"

export default function ViewProduct() {
  const { products } = useStore()
  const params = useParams()
  const productId = params.id as string

  return <ViewProductPage productId={productId} products={products} />
}
