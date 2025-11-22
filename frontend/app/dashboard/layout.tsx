"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string } | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handlePageChange = (page: string) => {
    router.push(`/dashboard/${page === "dashboard" ? "" : page}`)
  }

  const getCurrentPage = () => {
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length === 1) return "dashboard"
    return segments.slice(1).join("/")
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar currentPage={getCurrentPage()} onPageChange={handlePageChange} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
                {getCurrentPage()
                  .split("/")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")
                  .replace(/-/g, " ")}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.email}</p>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
