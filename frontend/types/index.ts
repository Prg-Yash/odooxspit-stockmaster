export * from "./auth"

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
  managerId?: string
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
