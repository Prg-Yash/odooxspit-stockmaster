import { password } from "bun";
import z from "zod";
import { UserRole } from "~/generated/prisma/enums";

export namespace AuthTypes {
  export type AuthRoles = "owner" | "manager" | "staff";
  export type SessionMetadata = {
    ipAddress: string | null;
    userAgent: string | null;
    deviceName: string | null;
    deviceType: string | null;
    browser: string | null;
    os: string | null;
  };

  export const SRegister = z.object({
    email: z.email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(64, "Password too long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&_]/,
        "Password must contain at least one special character (@, $, !, %, *, ?, &, _)"
      ),
    name: z.string(),
    role: z.enum(["owner", "manager", "staff"]),
  });

  export type TRegister = z.infer<typeof SRegister>;
}
