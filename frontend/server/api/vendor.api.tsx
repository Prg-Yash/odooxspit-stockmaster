"use client";

import { VendorTypes } from "@/types/vendor.types";
import { makeApiRequest } from "@/utils/api";
import { useMutation } from "@tanstack/react-query";
import { create } from "domain";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export const useVendor = () => {
  const [toastID, setToastID] = React.useState<string | number>("");
  const router = useRouter();

  const createVendorMutation = () =>
    useMutation({
      mutationFn: async (data: VendorTypes.TInsertVendor) => {
        const res = await makeApiRequest({
          endpoint: "/vendors",
          opts: {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          },
        });

        if (!res.ok) {
          console.log(await res.json());
          throw new Error("Failed to create a vendor");
        }

        return await res.json();
      },
      onMutate: () =>
        setToastID(toast.loading("Creating vendor...", { richColors: true })),
      onSuccess: () => {
        toast.success("Vendor created successfully!", { id: toastID });
        router.refresh();
      },
      onError: (err) => toast.error(err.message, { id: toastID }),
    });

  return { createVendorMutation };
};
