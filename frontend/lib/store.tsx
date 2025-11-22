"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Product, Vendor, Warehouse, MoveRecord } from "@/types"

interface StoreContextType {
  products: Product[]
  setProducts: (products: Product[]) => void
  vendors: Vendor[]
  setVendors: (vendors: Vendor[]) => void
  warehouses: Warehouse[]
  setWarehouses: (warehouses: Warehouse[]) => void
  moveRecords: MoveRecord[]
  setMoveRecords: (moveRecords: MoveRecord[]) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

const initialProducts: Product[] = [
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
]

const initialVendors: Vendor[] = [
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
]

const initialWarehouses: Warehouse[] = [
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
]

const initialMoveRecords: MoveRecord[] = [
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
]

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors)
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses)
  const [moveRecords, setMoveRecords] = useState<MoveRecord[]>(initialMoveRecords)

  return (
    <StoreContext.Provider
      value={{
        products,
        setProducts,
        vendors,
        setVendors,
        warehouses,
        setWarehouses,
        moveRecords,
        setMoveRecords,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
