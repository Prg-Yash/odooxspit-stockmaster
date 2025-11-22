"use client"

import { InventoryPage } from "@/components/inventory-page"
import { useStore } from "@/lib/store"

export default function Inventory() {
  const { products, warehouses } = useStore()

  return <InventoryPage products={products} warehouses={warehouses} />
}
