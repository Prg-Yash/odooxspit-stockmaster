"use client"

import { DashboardOverview } from "@/components/dashboard-overview"
import { useStore } from "@/lib/store"

export default function DashboardPage() {
  const { moveRecords } = useStore()

  return <DashboardOverview moveRecords={moveRecords} />
}
