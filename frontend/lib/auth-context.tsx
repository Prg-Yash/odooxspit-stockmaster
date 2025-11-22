"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { AuthUser } from "@/types"

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (data: any) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Demo user data
      const demoUser: AuthUser = {
        id: "1",
        email,
        name: "John Doe",
        role: email.includes("owner") ? "owner" : email.includes("manager") ? "manager" : "employee",
        companyId: "company-1",
        createdAt: new Date().toISOString(),
        company: {
          id: "company-1",
          name: "Demo Company",
          email: "demo@company.com",
          phone: "+1234567890",
          address: "123 Demo Street",
          city: "Demo City",
          country: "Demo Country",
          ownerId: "1",
          createdAt: new Date().toISOString(),
        },
      }

      if (demoUser.role === "manager" || demoUser.role === "employee") {
        demoUser.warehouseId = "warehouse-1"
      }

      localStorage.setItem("user", JSON.stringify(demoUser))
      setUser(demoUser)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: any) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newCompany = {
        id: `company-${Date.now()}`,
        name: data.companyName,
        email: data.companyEmail,
        phone: data.companyPhone,
        address: data.address,
        city: data.city,
        country: data.country,
        ownerId: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }

      const newUser: AuthUser = {
        id: newCompany.ownerId,
        email: data.ownerEmail,
        name: data.ownerName,
        role: "owner",
        companyId: newCompany.id,
        createdAt: new Date().toISOString(),
        company: newCompany,
      }

      localStorage.setItem("user", JSON.stringify(newUser))
      setUser(newUser)
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
