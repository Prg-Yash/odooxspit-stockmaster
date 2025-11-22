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

  const registerUser = () =>
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

  return { registerUser };
};
