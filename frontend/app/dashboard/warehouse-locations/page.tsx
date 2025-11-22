"use client"

import { WarehouseLocationsPage } from "@/components/warehouses/warehouse-locations-page"
import { useStore } from "@/lib/store"

export default function WarehouseLocations() {
  const { warehouses, setWarehouses } = useStore()

  return <WarehouseLocationsPage warehouses={warehouses} setWarehouses={setWarehouses} />
}
