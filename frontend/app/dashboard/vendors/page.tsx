"use client"

import { VendorsPage } from "@/components/vendors/vendors-page"
import { useStore } from "@/lib/store"

export default function Vendors() {
  const { vendors, setVendors } = useStore()

  return <VendorsPage vendors={vendors} setVendors={setVendors} />
}
