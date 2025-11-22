"use client"

import { GenerateReceiptPage } from "@/components/receipts/generate-receipt-page"
import { useStore } from "@/lib/store"

export default function GenerateReceipt() {
  const { vendors, products } = useStore()

  return <GenerateReceiptPage vendors={vendors} products={products} />
}
