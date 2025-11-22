"use client"

import { WarehousesPage } from "@/components/warehouses/warehouses-page"
import { useStore } from "@/lib/store"

export default function Warehouses() {
  const { warehouses, setWarehouses } = useStore()

  return <WarehousesPage warehouses={warehouses} setWarehouses={setWarehouses} />
}
