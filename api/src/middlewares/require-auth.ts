import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "~/lib/auth";
import { prisma } from "~/lib/prisma";
import type { AuthTypes } from "~/types/auth.types";

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const token = authHeader.slice(7);
    const decoded = verifyAccessToken(token);

    if (!decoded || typeof decoded === "string") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token.",
      });
    }

    const payload = decoded as AuthTypes.JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({
      success: false,
      message: "Authentication error.",
    });
  }
}

export { requireAuth };
