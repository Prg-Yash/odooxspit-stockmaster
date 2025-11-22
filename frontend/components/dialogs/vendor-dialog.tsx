"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Plus, Edit2 } from "lucide-react";
import type { Vendor } from "@/types";
import { useForm } from "react-hook-form";
import { VendorTypes } from "@/types/vendor.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVendor } from "@/server/api/vendor.api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

interface VendorDialogProps {
  vendor?: Vendor;
  vendors: Vendor[];
  setVendors: (vendors: Vendor[]) => void;
  trigger?: React.ReactNode;
}

function VendorForm({ vendor }: { vendor?: Vendor }) {
  const form = useForm<VendorTypes.TInsertVendor>({
    resolver: zodResolver(VendorTypes.SInsertVendor),
    defaultValues: vendor ?? {
      address: "",
      companyName: "",
      email: "",
      name: "",
      phone: "",
    },
  });

  const { createVendorMutation } = useVendor();
  const { mutateAsync: createVendor, isPending } = createVendorMutation();

  async function handleSubmit(values: VendorTypes.TInsertVendor) {
    await createVendor(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 py-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vendor Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name</FormLabel>
                <FormControl>
                  <Input placeholder="Tech Supplies Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="contact@vendor.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+1 234 567 8900" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Business St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {vendor ? "Update Vendor" : "Add Vendor"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default VendorForm;

export function VendorDialog({
  vendor,
  vendors,
  setVendors,
  trigger,
}: VendorDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus size={18} />
            Add Vendor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          <DialogDescription>
            {vendor
              ? "Update the vendor details below"
              : "Enter the details of the new vendor"}
          </DialogDescription>
        </DialogHeader>

        <VendorForm />
      </DialogContent>
    </Dialog>
  );
}
