import "dotenv/config";
import type { Request, Response } from "express";
import { UserRole } from "~/generated/prisma/enums";
import {
  createEmailVerificationToken,
  createPasswordResetToken,
  createRefreshToken,
  generateAccessToken,
  getCurrentSession,
  hashPassword,
  markEmailVerificationTokenUsed,
  markPasswordResetTokenUsed,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
  updateRefreshTokenLastUsed,
  verifyEmailVerificationToken,
  verifyPassword,
  verifyPasswordResetToken,
  verifyRefreshToken,
  createPasswordResetOTP,
  verifyPasswordResetOTP,
  isOTPVerified,
  invalidatePasswordResetOTP,
} from "~/lib/auth";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetOTPEmail,
} from "~/lib/mailer";
import { prisma } from "~/lib/prisma";
import { AuthTypes } from "~/types/auth.types";
import {
  generateDeviceName,
  getClientIp,
  parseUserAgent,
} from "~/utils/device-parser";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: true,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

async function register(req: Request, res: Response) {
  try {
    const result = AuthTypes.SRegister.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map(e => e.message).join(", ");
      return res.status(400).json({
        success: false,
        message: errors || "Validation failed."
      });
    }

    const data = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role:
          data.role === "owner"
            ? UserRole.OWNER
            : data.role === "manager"
              ? UserRole.MANAGER
              : UserRole.STAFF,
      },
    });

    // Generate email verification token
    const verificationToken = await createEmailVerificationToken(
      user.id,
      data.email
    );

    await sendVerificationEmail(data.email, verificationToken);

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration.",
    });
  }
}

/**
 * Verify email address
 */
async function verifyEmail(req: Request, res: Response) {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/verify/error?reason=missing_params`
      );
    }

    // Verify token
    const verificationToken = await verifyEmailVerificationToken(
      token as string,
      email as string
    );

    if (!verificationToken) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/verify/error?reason=invalid_or_expired`
      );
    }

    // Update user's emailVerified status
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    });

    // Mark token as used
    await markEmailVerificationTokenUsed(verificationToken.id);

    // Send welcome email
    await sendWelcomeEmail(
      email as string,
      verificationToken.user.name as string
    );

    return res.redirect(`${process.env.FRONTEND_URL}/verify/success`);
  } catch (error) {
    console.error("Verify email error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/verify/error?reason=internal_server_error`
    );
  }
}

/**
 * Login user
 */
async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    // Generate access token
    const accessToken = generateAccessToken(user.id, user.email);

    // Extract session metadata
    const userAgent = req.headers["user-agent"] || "";
    const ipAddress = getClientIp(req);
    const deviceInfo = parseUserAgent(userAgent);
    const deviceName = generateDeviceName(
      deviceInfo.browser,
      deviceInfo.os,
      deviceInfo.deviceType
    );

    // Generate refresh token with session metadata
    const refreshToken = await createRefreshToken(user.id, {
      ipAddress,
      userAgent,
      deviceName,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
    });

    res.cookie("accessToken", accessToken, COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        accessToken,
        refreshToken, // Include refresh token in response for non-cookie clients
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login.",
    });
  }
}

/**
 * Refresh access token
 */
async function refreshToken(req: Request, res: Response) {
  try {
    // Try to get refresh token from cookie first, then from body (for testing)
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message:
          "Refresh token not found. Please provide refresh token in cookie or request body.",
      });
    }

    // Verify refresh token
    const tokenData = await verifyRefreshToken(refreshToken);

    if (!tokenData) {
      res.clearCookie("refreshToken");
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token.",
      });
    }

    // Update last used timestamp
    await updateRefreshTokenLastUsed(refreshToken);

    // Revoke old refresh token
    await revokeRefreshToken(refreshToken);

    // Generate new access token
    const accessToken = generateAccessToken(
      tokenData.user.id,
      tokenData.user.email
    );

    // Extract session metadata for new token
    const userAgent = req.headers["user-agent"] || "";
    const ipAddress = getClientIp(req);
    const deviceInfo = parseUserAgent(userAgent);
    const deviceName = generateDeviceName(
      deviceInfo.browser,
      deviceInfo.os,
      deviceInfo.deviceType
    );

    // Generate new refresh token (rotation) with session metadata
    const newRefreshToken = await createRefreshToken(tokenData.user.id, {
      ipAddress,
      userAgent,
      deviceName,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
    });

    // Set new refresh token in cookie
    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      data: {
        accessToken,
        refreshToken: newRefreshToken, // Also return in response for non-cookie clients
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during token refresh.",
    });
  }
}

/**
 * Logout user
 */
async function logout(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      // Get session info before revoking (for logging/tracking)
      const session = await getCurrentSession(refreshToken);

      if (session) {
        console.log(
          `User session logout: ${session.deviceName} at ${session.ipAddress}`
        );
      }

      // Revoke refresh token
      await revokeRefreshToken(refreshToken);
    }

    // Clear cookie
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during logout.",
    });
  }
}

/**
 * Request password reset
 */
async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Find user (prevent user enumeration by always returning success)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Generate password reset token
      const resetToken = await createPasswordResetToken(user.id, email);

      // Send password reset email
      await sendPasswordResetEmail(email, resetToken);
    }

    // Always return success to prevent user enumeration
    res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Request password reset error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
}

/**
 * Reset password
 */
async function resetPassword(req: Request, res: Response) {
  try {
    const { token, email, newPassword } = req.body;

    // Validate input
    if (!token || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, email, and new password are required.",
      });
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // Verify token
    const resetToken = await verifyPasswordResetToken(token, email);

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user's password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await markPasswordResetTokenUsed(resetToken.id);

    // Revoke all refresh tokens (force logout everywhere)
    await revokeAllUserRefreshTokens(resetToken.userId);

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during password reset.",
    });
  }
}

/**
 * Resend verification email
 */
async function resendVerificationEmail(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Prevent user enumeration - always return success
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an unverified account with that email exists, a verification email has been sent.",
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified.",
      });
    }

    // Check for recent verification token (rate limiting - prevent spam)
    const recentToken = await prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        email: email,
        used: false,
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        },
      },
    });

    if (recentToken) {
      return res.status(429).json({
        success: false,
        message:
          "Please wait 2 minutes before requesting another verification email.",
      });
    }

    // Invalidate old unused tokens for this email
    await prisma.emailVerificationToken.updateMany({
      where: {
        userId: user.id,
        email: email,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generate new verification token
    const verificationToken = await createEmailVerificationToken(
      user.id,
      email
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification email error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while sending verification email.",
    });
  }
}

/**
 * Request password reset with OTP (Step 1)
 */
async function requestPasswordResetOTP(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Find user (prevent user enumeration by always returning success)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Check for recent OTP request (rate limiting - 60 seconds cooldown)
      const recentOTP = await prisma.passwordResetOTP.findFirst({
        where: {
          userId: user.id,
          email: email,
          createdAt: {
            gte: new Date(Date.now() - 60 * 1000), // 60 seconds ago
          },
        },
      });

      if (recentOTP) {
        return res.status(429).json({
          success: false,
          message:
            "Please wait 60 seconds before requesting another OTP.",
        });
      }

      // Generate OTP
      console.log(`🔐 Generating OTP for user: ${email}`);
      const otp = await createPasswordResetOTP(user.id, email);
      console.log(`🔐 OTP generated: ${otp} (will be sent via email)`);

      // Send OTP email
      console.log(`📧 Attempting to send OTP email to: ${email}`);
      const emailSent = await sendPasswordResetOTPEmail(email, otp);
      console.log(`📧 Email send result: ${emailSent ? 'SUCCESS' : 'FAILED'}`);
    } else {
      console.log(`⚠️  User not found for email: ${email} (but returning success to prevent enumeration)`);
    }

    // Always return success to prevent user enumeration
    res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, an OTP has been sent to your email.",
    });
  } catch (error) {
    console.error("Request password reset OTP error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
}

/**
 * Verify OTP (Step 2)
 */
async function verifyOTP(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    // Verify OTP
    const result = await verifyPasswordResetOTP(email, otp);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message:
        "OTP verified successfully. You can now reset your password.",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during OTP verification.",
    });
  }
}

/**
 * Reset password with verified OTP (Step 3)
 */
async function resetPasswordWithOTP(req: Request, res: Response) {
  try {
    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required.",
      });
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // Check if OTP was verified
    const otpVerified = await isOTPVerified(email);

    if (!otpVerified) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not verified or expired. Please request a new OTP and verify it first.",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Invalidate OTP
    await invalidatePasswordResetOTP(email);

    // Revoke all refresh tokens (force logout everywhere)
    await revokeAllUserRefreshTokens(user.id);

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password with OTP error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during password reset.",
    });
  }
}

export {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  resetPassword,
  resendVerificationEmail,
  requestPasswordResetOTP,
  verifyOTP,
  resetPasswordWithOTP,
};
