"use client";

import { AuthTypes } from "@/types/auth.types";
import { makeApiRequest } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export const useAuthentication = () => {
  const router = useRouter();
  const [toastID, setToastID] = React.useState<string | number>("");

  const registerMutation = () =>
    useMutation({
      mutationFn: async (data: AuthTypes.TRegisterUser) => {
        const res = await makeApiRequest({
          endpoint: "/auth/register",
          opts: {
            body: JSON.stringify(data),
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
        });

        if (!res.ok) {
          const error = (await res.json()) as any;
          throw new Error(error.message);
        }

        return await res.json();
      },
      onMutate: () =>
        setToastID(toast.loading("Registering user...", { richColors: true })),
      onError: (error) => toast.error(error.message, { id: toastID }),
      onSuccess: () => {
        toast.success("User has been registered successfully", { id: toastID });
        router.push("/verify");
      },
    });

  const loginMutation = () =>
    useMutation({
      mutationFn: async (data: AuthTypes.TLoginUser) => {
        const res = await makeApiRequest({
          endpoint: "/auth/login",
          opts: {
            body: JSON.stringify(data),
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
        });

        if (!res.ok) {
          const error = (await res.json()) as any;
          throw new Error(error.message);
        }

        const responseData = await res.json();

        // Store token in localStorage as backup (in case cookies don't work)
        if (responseData.data?.accessToken) {
          localStorage.setItem('devAccessToken', responseData.data.accessToken);
        }

        // Store user data for UI
        if (responseData.data?.user) {
          localStorage.setItem('user', JSON.stringify(responseData.data.user));
        }

        return responseData;
      },

      onMutate: () =>
        setToastID(toast.loading("Loggin in...", { richColors: true })),
      onError: (error) => toast.error(error.message, { id: toastID }),
      onSuccess: () => {
        toast.success("Logged in successfully", { id: toastID });
        router.push("/dashboard");
      },
    });

  return { registerMutation, loginMutation };
};
