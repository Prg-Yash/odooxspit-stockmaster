"use client"

import { MoveHistoryPreviewPage } from "@/components/move-history-preview"
import { useStore } from "@/lib/store"

export default function MoveHistory() {
  const { moveRecords } = useStore()

  return <MoveHistoryPreviewPage moveRecords={moveRecords} />
}
