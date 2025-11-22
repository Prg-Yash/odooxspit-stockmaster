"use client"

import { ProductsListPage } from "@/components/products/products-list-page"
// import { ProductsListPage } from "@/components/products/products-list-page"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"

export default function ProductsPage() {
  const { products } = useStore()
  const router = useRouter()

  return (
    <ProductsListPage
      products={products}
      onEditProduct={(id) => router.push(`/dashboard/products/edit/${id}`)}
      onViewProduct={(id) => router.push(`/dashboard/products/view/${id}`)}
    />
  )
}
