"use client"

import { AuthForm } from "@/components/auth-form"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = (credentials: { email: string; password: string }) => {
    // Store auth state (you can use context/cookies/local storage)
    localStorage.setItem("user", JSON.stringify({ email: credentials.email }))
    router.push("/dashboard")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <AuthForm onSuccess={handleLogin} />
    </div>
  )
}
