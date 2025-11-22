"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Package,
  Warehouse,
  TrendingUp,
  Receipt,
  LogOut,
  Menu,
  X,
  Building2,
  Users,
  History,
} from "lucide-react"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string, productId?: string) => void
  onLogout: () => void
}

export function Sidebar({ currentPage, onPageChange, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "inventory", label: "Inventory", icon: Warehouse },
    { id: "warehouse", label: "Warehouses", icon: Building2 },
    { id: "warehouse-locations", label: "Warehouse Locations", icon: TrendingUp },
    { id: "vendors", label: "Vendors", icon: Users },
    { id: "moves", label: "Move History", icon: TrendingUp },
    { id: "move-history", label: "Recent Moves", icon: History },
    { id: "receipts", label: "Receipts", icon: Receipt },
  ]

  const handleNavigation = (pageId: string) => {
    onPageChange(pageId)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
      >
        {isOpen ? (
          <X size={24} className="text-sidebar-foreground" />
        ) : (
          <Menu size={24} className="text-sidebar-foreground" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative h-screen bg-sidebar border-r-2 border-sidebar-border transition-all duration-300 z-40 w-64 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 md:p-6 border-b-2 border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-sidebar-primary-foreground font-bold text-lg">S</span>
            </div>
            <div className="animate-slide-in-up min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-sidebar-foreground truncate">StockMaster</h1>
              <p className="text-xs text-sidebar-accent opacity-75">Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-200 group text-sm md:text-base ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                    : "text-sidebar-accent hover:bg-sidebar-accent/20 "
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="text-left truncate">{item.label}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-sidebar-primary-foreground rounded-full ml-auto shrink-0" />
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-3 md:p-4 border-t-2 border-sidebar-border mt-auto">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-all duration-200 text-sm md:text-base"
          >
            <LogOut size={18} />
            <span className="text-left">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}
