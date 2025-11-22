"use client";

import { VendorTypes } from "@/types/vendor.types";
import { api } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export const useVendor = () => {
  const [toastID, setToastID] = React.useState<string | number>("");
  const router = useRouter();

  const createVendorMutation = () =>
    useMutation({
      mutationFn: async (data: VendorTypes.TInsertVendor) => {
        try {
          console.log("=== VENDOR CREATION DEBUG ===");
          console.log("1. Vendor data to send:", data);

          const userStr = localStorage.getItem("user");
          console.log("2. User from localStorage (raw):", userStr);

          let userRole = "UNKNOWN";
          if (userStr) {
            const user = JSON.parse(userStr);
            console.log("3. Parsed user:", user);
            console.log("4. User role from localStorage:", user.role);
            userRole = user.role;
          }

          const token = localStorage.getItem("devAccessToken");
          const hasLocalStorageToken = !!token;
          console.log("5. Token from localStorage:", token ? `${token.substring(0, 20)}...` : "❌ No token");

          // Check cookies - NOTE: Backend cookies are httpOnly so JavaScript CAN'T read them
          const readableCookies = document.cookie;
          console.log("6. Readable cookies:", readableCookies || "❌ None (httpOnly cookies are hidden from JS)");

          console.log("\n7. 🔐 AUTH METHOD DETECTED:");
          if (hasLocalStorageToken) {
            console.log("   ✅ Using DEV LOGIN (localStorage token)");
            console.log("   📤 Token will be sent in Authorization header");
          } else if (!readableCookies || readableCookies.trim() === "") {
            console.log("   ⚠️ Using REGULAR LOGIN (httpOnly cookies)");
            console.log("   📤 Cookies sent automatically by browser");
          } else {
            console.log("   ❓ Unclear - may need to re-login");
          }

          console.log("\n8. 📊 PERMISSION CHECK (localStorage):");
          console.log(`   User role: ${userRole}`);
          console.log(`   Required: OWNER or MANAGER`);
          console.log(`   Should work: ${userRole === "OWNER" || userRole === "MANAGER" ? "✅ YES" : "❌ NO"}`);

          // Verify what backend sees by calling /users/me first
          console.log("\n9. 🔍 VERIFYING BACKEND USER DATA:");
          try {
            const currentUser = await api.get("/user/me");
            console.log("   Backend sees user:", currentUser.data.user);
            console.log("   Backend sees role:", currentUser.data.user.role);
            console.log(`   ✅ Backend role check: ${currentUser.data.user.role === "OWNER" || currentUser.data.user.role === "MANAGER" ? "PASS" : "FAIL"}`);
          } catch (error: any) {
            console.log("   ❌ Failed to verify user:", error.message);
          }

          console.log("\n=== MAKING VENDOR CREATION REQUEST ===");
          const response = await api.post("/vendors", data);
          console.log("=== ✅ SUCCESS ===");
          console.log("Created vendor:", response);
          return response;
        } catch (error: any) {
          // Extract error message from API response
          console.error("=== VENDOR CREATION ERROR ===");
          console.error("Error object:", error);
          console.error("Error status:", error.status);
          console.error("Error data:", error.data);
          const errorMessage = error.data?.error || error.message || "Failed to create vendor";
          throw new Error(errorMessage);
        }
      },
      onMutate: () =>
        setToastID(toast.loading("Creating vendor...", { richColors: true })),
      onSuccess: () => {
        toast.success("Vendor created successfully!", { id: toastID });
      },
      onError: (err: Error) => {
        // Only show error if it's not a 401 (401 will auto-redirect)
        toast.error(err.message, { id: toastID });
      },
    });

  return { createVendorMutation };
};
