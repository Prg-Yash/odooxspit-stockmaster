import z from "zod";

export namespace VendorTypes {
  export const SInsertVendor = z.object({
    name: z.string().min(1, "Vendor name is required"),
    companyName: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  });

  export type TInsertVendor = z.infer<typeof SInsertVendor>;
}
