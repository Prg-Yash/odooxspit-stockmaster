"use client"

import { EditProductPage } from "@/components/products/edit-product-page"
import { useParams } from "next/navigation"

export default function EditProduct() {
  const params = useParams()
  const productId = params.id as string

  return <EditProductPage productId={productId} />
}
