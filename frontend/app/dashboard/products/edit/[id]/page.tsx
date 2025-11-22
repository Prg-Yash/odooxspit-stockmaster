"use client"

// import { EditProductPage } from "@/components/products/edit-product-page"
import { useStore } from "@/lib/store"
import { useRouter, useParams } from "next/navigation"

export default function EditProduct() {
  const { products, setProducts } = useStore()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  return (
    // <EditProductPage
    //   productId={productId}
    //   products={products}
    //   onProductUpdate={(updated) => {
    //     setProducts(products.map((p) => (p.id === updated.id ? updated : p)))
    //     router.push("/dashboard/products")
    //   }}
    // />
    <></>
  )
}
