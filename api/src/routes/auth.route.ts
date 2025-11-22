import express from "express";
import {
  login,
  logout,
  refreshToken,
  register,
  requestPasswordReset,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
  requestPasswordResetOTP,
  verifyOTP,
  resetPasswordWithOTP,
} from "~/controllers/auth.controller";

const authRouter = express.Router();

authRouter.post("/register", register);

// Verify email
authRouter.get("/verify-email", verifyEmail);

// Resend verification email
authRouter.post("/resend-verification-email", resendVerificationEmail);

// Login
authRouter.post("/login", login);

// Refresh access token
authRouter.post("/refresh-token", refreshToken);

// Logout
authRouter.post("/logout", logout);

// Request password reset
authRouter.post("/request-password-reset", requestPasswordReset);

// Reset password
authRouter.post("/reset-password", resetPassword);

// OTP-based password reset endpoints
// Step 1: Request OTP
authRouter.post("/request-password-reset-otp", requestPasswordResetOTP);

// Step 2: Verify OTP
authRouter.post("/verify-otp", verifyOTP);

// Step 3: Reset password with verified OTP
authRouter.post("/reset-password-with-otp", resetPasswordWithOTP);

export { authRouter };
