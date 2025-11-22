"use client"

import { useState } from "react"
import { AuthForm } from "@/components/auth-form"
import { Sidebar } from "@/components/sidebar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { ProductsListPage } from "@/components/products/products-list-page"
import { CreateProductPage } from "@/components/products/create-product-page"
import { EditProductPage } from "@/components/products/edit-product-page"
import { ViewProductPage } from "@/components/products/view-product-page"
import { InventoryPage } from "@/components/inventory-page"
import { WarehousesPage } from "@/components/warehouses/warehouses-page"
import { WarehouseLocationsPage } from "@/components/warehouses/warehouse-locations-page"
import { MovesPage } from "@/components/moves-page"
import { ReceiptsPage } from "@/components/receipts/receipts-page"
import { GenerateReceiptPage } from "@/components/receipts/generate-receipt-page"
import { VendorsPage } from "@/components/vendors/vendors-page"
import { MoveHistoryPreviewPage } from "@/components/move-history-preview"

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  quantity: number
  description?: string
  createdAt: string
  history: ProductHistory[]
}

export interface ProductHistory {
  id: string
  action: "created" | "quantity_increased" | "quantity_decreased"
  quantity: number
  previousQuantity: number
  date: string
  notes?: string
}

export interface Vendor {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  createdAt: string
}

export interface Warehouse {
  id: string
  name: string
  location: string
  capacity: number
  usedCapacity: number
  locations: WarehouseLocation[]
}

export interface WarehouseLocation {
  id: string
  warehouseId: string
  name: string
  type: "rack" | "shelf" | "production" | "storage"
  capacity: number
  usedCapacity: number
}

export interface MoveRecord {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  fromLocation: string
  toLocation: string
  moveType: "in-warehouse" | "warehouse-to-warehouse" | "delivery" | "incoming"
  vendorId?: string
  date: string
  status: "pending" | "in-transit" | "completed"
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [user, setUser] = useState<{ email: string } | null>(null)

  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Laptop Pro",
      sku: "LP-001",
      category: "Electronics",
      price: 1299,
      quantity: 45,
      description: "High-performance laptop for professionals",
      createdAt: "2024-01-10",
      history: [
        { id: "h1", action: "created", quantity: 50, previousQuantity: 0, date: "2024-01-10" },
        {
          id: "h2",
          action: "quantity_decreased",
          quantity: 45,
          previousQuantity: 50,
          date: "2024-01-15",
          notes: "Sold 5 units",
        },
      ],
    },
    {
      id: "2",
      name: "USB Cable",
      sku: "UC-001",
      category: "Accessories",
      price: 9.99,
      quantity: 500,
      description: "Universal USB-C cable",
      createdAt: "2024-01-12",
      history: [
        { id: "h3", action: "created", quantity: 300, previousQuantity: 0, date: "2024-01-12" },
        {
          id: "h4",
          action: "quantity_increased",
          quantity: 500,
          previousQuantity: 300,
          date: "2024-01-18",
          notes: "Restock from vendor",
        },
      ],
    },
  ])

  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: "1",
      name: "Tech Supplies Inc",
      email: "contact@techsupplies.com",
      phone: "+1-555-0101",
      address: "123 Tech St",
      city: "San Francisco",
      country: "USA",
      createdAt: "2024-01-01",
    },
    {
      id: "2",
      name: "Electronics Ltd",
      email: "sales@electronicsltd.com",
      phone: "+1-555-0102",
      address: "456 Electronic Ave",
      city: "Los Angeles",
      country: "USA",
      createdAt: "2024-01-02",
    },
  ])

  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: "1",
      name: "Main Warehouse",
      location: "New York",
      capacity: 10000,
      usedCapacity: 7500,
      locations: [
        { id: "loc1", warehouseId: "1", name: "Rack A", type: "rack", capacity: 5000, usedCapacity: 3500 },
        { id: "loc2", warehouseId: "1", name: "Rack B", type: "rack", capacity: 3000, usedCapacity: 2500 },
        {
          id: "loc3",
          warehouseId: "1",
          name: "Production House 1",
          type: "production",
          capacity: 2000,
          usedCapacity: 1500,
        },
      ],
    },
    {
      id: "2",
      name: "Branch Warehouse",
      location: "Los Angeles",
      capacity: 5000,
      usedCapacity: 3200,
      locations: [
        { id: "loc4", warehouseId: "2", name: "Shelf 1", type: "shelf", capacity: 2500, usedCapacity: 1600 },
        { id: "loc5", warehouseId: "2", name: "Shelf 2", type: "shelf", capacity: 2500, usedCapacity: 1600 },
      ],
    },
  ])

  const [moveRecords, setMoveRecords] = useState<MoveRecord[]>([
    {
      id: "1",
      productId: "1",
      productName: "Laptop Pro",
      sku: "LP-001",
      quantity: 10,
      fromLocation: "Rack A",
      toLocation: "Production House 1",
      moveType: "in-warehouse",
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: "2",
      productId: "2",
      productName: "USB Cable",
      sku: "UC-001",
      quantity: 100,
      fromLocation: "Main Warehouse",
      toLocation: "Branch Warehouse",
      moveType: "warehouse-to-warehouse",
      date: "2024-01-16",
      status: "in-transit",
    },
  ])

  const handleLogin = (credentials: { email: string; password: string }) => {
    setUser({ email: credentials.email })
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setCurrentPage("dashboard")
  }

  const handlePageChange = (page: string, productId?: string) => {
    setCurrentPage(page)
    if (productId) {
      setSelectedProductId(productId)
    }
  }

  if (!isAuthenticated) {
    return <AuthForm onSuccess={handleLogin} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardOverview moveRecords={moveRecords} />
      case "products":
        return (
          <ProductsListPage
            products={products}
            onEditProduct={(id) => handlePageChange("edit-product", id)}
            onViewProduct={(id) => handlePageChange("view-product", id)}
          />
        )
      case "create-product":
        return (
          <CreateProductPage
            onProductCreate={(newProduct) => {
              setProducts([...products, newProduct])
              setCurrentPage("products")
            }}
          />
        )
      case "edit-product":
        return selectedProductId ? (
          <EditProductPage
            productId={selectedProductId}
            products={products}
            onProductUpdate={(updated) => {
              setProducts(products.map((p) => (p.id === updated.id ? updated : p)))
              setCurrentPage("products")
            }}
          />
        ) : null
      case "view-product":
        return selectedProductId ? <ViewProductPage productId={selectedProductId} products={products} /> : null
      case "inventory":
        return <InventoryPage products={products} warehouses={warehouses} />
      case "warehouse":
        return <WarehousesPage warehouses={warehouses} setWarehouses={setWarehouses} />
      case "warehouse-locations":
        return <WarehouseLocationsPage warehouses={warehouses} setWarehouses={setWarehouses} />
      case "moves":
        return (
          <MovesPage
            moveRecords={moveRecords}
            setMoveRecords={setMoveRecords}
            products={products}
            warehouses={warehouses}
            vendors={vendors}
          />
        )
      case "move-history":
        return <MoveHistoryPreviewPage moveRecords={moveRecords} />
      case "receipts":
        return <ReceiptsPage />
      case "generate-receipt":
        return <GenerateReceiptPage vendors={vendors} products={products} />
      case "vendors":
        return <VendorsPage vendors={vendors} setVendors={setVendors} />
      default:
        return <DashboardOverview moveRecords={moveRecords} />
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
                {currentPage === "create-product"
                  ? "Create Product"
                  : currentPage === "edit-product"
                    ? "Edit Product"
                    : currentPage === "view-product"
                      ? "Product Details"
                      : currentPage === "generate-receipt"
                        ? "Generate Receipt"
                        : currentPage === "move-history"
                          ? "Move History Preview"
                          : currentPage === "warehouse-locations"
                            ? "Warehouse Locations"
                            : currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace(/-/g, " ")}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.email}</p>
            </div>
          </div>
          {renderPage()}
        </div>
      </main>
    </div>
  )
}
