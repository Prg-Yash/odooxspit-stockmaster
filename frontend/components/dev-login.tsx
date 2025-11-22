"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

/**
 * Development Login Component
 * Temporary component to get auth token for testing
 * Remove this once proper auth context is implemented
 */
export function DevLogin() {
  const [email, setEmail] = useState("yashnimse42@gmail.com");
  const [password, setPassword] = useState("NewSecurePassword123!");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage for development
        localStorage.setItem("devAccessToken", data.data.accessToken);
        localStorage.setItem("devUser", JSON.stringify(data.data.user));

        toast({
          title: "Success!",
          description: "Logged in successfully. Token stored in localStorage.",
        });

        console.log("✅ Dev login successful:", data.data.user);
      } else {
        toast({
          title: "Login failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("devAccessToken");
    localStorage.removeItem("devUser");
    toast({
      title: "Logged out",
      description: "Token cleared from localStorage",
    });
  };

  // Check if already logged in
  const hasToken =
    typeof window !== "undefined" && localStorage.getItem("devAccessToken");

  if (hasToken) {
    const user = JSON.parse(localStorage.getItem("devUser") || "{}");
    return (
      <Card className="mb-4 border-yellow-500 bg-yellow-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">🔧 Dev Mode - Logged In</CardTitle>
          <CardDescription className="text-xs">
            {user.email} ({user.role})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Clear Dev Token
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-yellow-500 bg-yellow-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">🔧 Development Login</CardTitle>
        <CardDescription className="text-xs">
          Temporary login for testing (remove when auth is ready)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-9"
        />
        <Button
          onClick={handleLogin}
          disabled={isLoading}
          size="sm"
          className="w-full"
        >
          {isLoading ? "Logging in..." : "Dev Login"}
        </Button>
      </CardContent>
    </Card>
  );
}
