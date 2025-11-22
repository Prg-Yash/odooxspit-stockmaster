import express from "express";
import {
  deleteAccount,
  getProfile,
  updateProfile,
} from "~/controllers/user.controller";
import { requireAuth } from "~/middlewares/require-auth";

const userRouter = express.Router();

userRouter.use(requireAuth);

// Get current user profile
userRouter.get("/me", getProfile);

// Update user profile
userRouter.put("/update", updateProfile);

// Delete user account
userRouter.delete("/delete", deleteAccount);

export { userRouter };
