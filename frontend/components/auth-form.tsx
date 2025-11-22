"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuthFormProps {
  onSuccess: (credentials: { email: string; password: string }) => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      onSuccess({ email, password })
      setIsLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4 animate-fade-in">
      <Card className="w-full max-w-md border-2 shadow-lg animate-scale-in">
        <CardHeader className="space-y-2 border-b border-border pb-4 md:pb-6">
          <div className="flex items-center gap-2 mb-2 md:mb-4">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-accent-foreground font-bold text-sm md:text-base">S</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-foreground">StockMaster</span>
          </div>
          <CardTitle className="text-xl md:text-2xl">{isLogin ? "Login" : "Sign Up"}</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {isLogin ? "Access your inventory management system" : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs md:text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@stockmaster.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 md:h-10 border-2 focus:border-accent transition-colors text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs md:text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 md:h-10 border-2 focus:border-accent transition-colors text-sm"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-xs md:text-sm font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-9 md:h-10 border-2 focus:border-accent transition-colors text-sm"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 md:h-10 bg-accent hover:bg-accent/90 text-accent-foreground font-medium transition-all duration-200 transform hover:scale-105 text-sm md:text-base"
            >
              {isLoading ? "Loading..." : isLogin ? "Login" : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setEmail("")
                setPassword("")
                setConfirmPassword("")
              }}
              className="w-full text-center text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
