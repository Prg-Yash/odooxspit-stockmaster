export interface User {
  id: string
  email: string
  name: string
  role: "owner" | "manager" | "employee"
  companyId: string
  warehouseId?: string // For managers and employees
  createdAt: string
}

export interface Company {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  ownerId: string
  createdAt: string
}

export interface AuthUser extends User {
  company: Company
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCompanyData {
  // Company Details
  companyName: string
  companyEmail: string
  companyPhone: string
  address: string
  city: string
  country: string
  
  // Owner Details
  ownerName: string
  ownerEmail: string
  password: string
  confirmPassword: string
}

export interface InviteUserData {
  name: string
  email: string
  role: "manager" | "employee"
  warehouseId?: string
}
