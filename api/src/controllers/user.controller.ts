import type { Request, Response } from "express";
import { Prisma } from "~/generated/prisma/client";
import {
  createEmailVerificationToken,
  hashPassword,
  revokeAllUserRefreshTokens,
  verifyPassword,
} from "~/lib/auth";
import { sendVerificationEmail } from "~/lib/mailer";
import { prisma } from "~/lib/prisma";

/**
 * Get current user profile
 */
async function getProfile(req: Request, res: Response) {
  try {
    // User is already attached to req by requireAuth middleware
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching profile.",
    });
  }
}

/**
 * Update user profile
 */
type UpdateProfileBody = {
  name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
};

async function updateProfile(
  req: Request<{}, any, UpdateProfileBody>,
  res: Response
) {
  try {
    const { name, email, password, currentPassword } = req.body;
    const userId = req.user.id;

    const updateData: Prisma.UserUpdateInput = {};

    // Update name
    if (name !== undefined) {
      updateData.name = name;
    }

    // Update email
    if (email && email !== req.user.email) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format.",
        });
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use.",
        });
      }

      updateData.email = email;
      updateData.emailVerified = false; // Require re-verification

      // Generate and send verification email for new email
      const verificationToken = await createEmailVerificationToken(
        userId,
        email
      );
      await sendVerificationEmail(email, verificationToken);
    }

    // Update password
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set a new password.",
        });
      }

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // Verify current password
      const isPasswordValid = await verifyPassword(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }

      // Password strength validation
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long.",
        });
      }

      // Hash new password
      updateData.password = await hashPassword(password);

      // Revoke all refresh tokens (force logout everywhere)
      await revokeAllUserRefreshTokens(userId);
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update.",
      });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    let message = "Profile updated successfully.";
    if (password) {
      message += " Please log in again.";
    }
    if (email && email !== req.user.email) {
      message +=
        " A verification email has been sent to your new email address.";
    }

    res.status(200).json({
      success: true,
      message: message,
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating profile.",
    });
  }
}

/**
 * Delete user account
 */
type DeleteAccountBody = {
  password: string;
};

async function deleteAccount(
  req: Request<{}, any, DeleteAccountBody>,
  res: Response
) {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account.",
      });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    // Delete user (cascade will delete related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear cookie
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting account.",
    });
  }
}

/**
 * Search users by email (for adding to warehouse)
 */
async function searchUsers(req: Request, res: Response) {
  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email query parameter is required",
      });
    }

    // Search for users by email (case-insensitive, partial match)
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: "insensitive",
        },
        emailVerified: true, // Only return verified users
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        warehouseMemberships: {
          select: {
            warehouse: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            role: true,
          },
        },
      },
      take: 10, // Limit results
    });

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while searching users.",
    });
  }
}

/**
 * Get all employees with warehouse assignments
 * Only accessible by OWNER role
 */
async function getAllEmployees(req: Request, res: Response) {
  try {
    // Check if user is OWNER
    if (req.user.role !== "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Only owners can view all employees.",
      });
    }

    // Get all users with their warehouse memberships
    const employees = await prisma.user.findMany({
      where: {
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        warehouseMemberships: {
          select: {
            id: true,
            role: true,
            warehouse: {
              select: {
                id: true,
                name: true,
                code: true,
                city: true,
                state: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          role: "asc", // OWNER first, then MANAGER, then STAFF
        },
        {
          createdAt: "asc",
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: { employees },
    });
  } catch (error) {
    console.error("Get all employees error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching employees.",
    });
  }
}

export { getProfile, updateProfile, deleteAccount, searchUsers, getAllEmployees };
