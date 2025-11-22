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

// Request password reset
userRouter.post("/request-password-reset", requestPasswordReset);

// Reset password
userRouter.post("/reset-password", resetPassword);

export { userRouter };
