"use client"

import { CreateProductPage } from "@/components/products/create-product-page"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"

export default function CreateProduct() {
  const { products, setProducts } = useStore()
  const router = useRouter()

  return (
    <CreateProductPage
      onProductCreate={(newProduct) => {
        setProducts([...products, newProduct])
        router.push("/dashboard/products")
      }}
    />
  )
}
