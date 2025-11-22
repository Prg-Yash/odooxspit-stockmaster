"use client"

import { MovesPage } from "@/components/moves-page"
import { useStore } from "@/lib/store"

export default function Moves() {
  const { moveRecords, setMoveRecords, products, warehouses, vendors } = useStore()

  return (
    <MovesPage
      moveRecords={moveRecords}
      setMoveRecords={setMoveRecords}
      products={products}
      warehouses={warehouses}
      vendors={vendors}
    />
  )
}
