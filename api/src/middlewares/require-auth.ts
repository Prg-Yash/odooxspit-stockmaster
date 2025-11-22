import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "~/lib/auth";
import { prisma } from "~/lib/prisma";

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

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
