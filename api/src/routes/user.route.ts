import express from "express";
import {
  login,
  logout,
  refreshToken,
  register,
  requestPasswordReset,
  requestPasswordResetOTP,
  resendVerificationEmail,
  resetPassword,
  resetPasswordWithOTP,
  verifyEmail,
  verifyOTP,
} from "~/controllers/auth.controller";

const userRouter = express.Router();

userRouter.post("/register", register);

// Verify email
userRouter.get("/verify-email", verifyEmail);

// Resend verification email
userRouter.post("/resend-verification-email", resendVerificationEmail);

// Login
userRouter.post("/login", login);

// Refresh access token
userRouter.post("/refresh-token", refreshToken);

// Logout
userRouter.post("/logout", logout);

// Request password reset (original token-based method)
userRouter.post("/request-password-reset", requestPasswordReset);

// Reset password (original token-based method)
userRouter.post("/reset-password", resetPassword);

// ========== OTP-BASED PASSWORD RESET ==========

// Request OTP for password reset
userRouter.post("/request-password-reset-otp", requestPasswordResetOTP);

// Verify OTP and get reset token
userRouter.post("/verify-otp", verifyOTP);

// Reset password with OTP (uses reset token from OTP verification)
userRouter.post("/reset-password-otp", resetPasswordWithOTP);

export { userRouter };
