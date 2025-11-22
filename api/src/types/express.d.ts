import type { User } from "~/generated/prisma/client";

type AuthenticatedUser = Pick<
  User,
  "id" | "email" | "name" | "emailVerified" | "createdAt" | "updatedAt" | "role"
>;

declare module "express-serve-static-core" {
  interface Request {
    user: AuthenticatedUser;
  }
}
