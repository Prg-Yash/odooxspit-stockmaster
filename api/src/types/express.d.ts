import type { User } from "~/generated/prisma/client";

type AuthenticatedUser = Pick<
  User,
  "id" | "email" | "name" | "emailVerified" | "createdAt" | "updatedAt"
>;

declare module "express-serve-static-core" {
  interface Request {
    user: AuthenticatedUser;
  }
}
