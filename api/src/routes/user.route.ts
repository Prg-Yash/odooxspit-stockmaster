import express from "express";
import { requireAuth } from "~/middlewares/require-auth";
import { getProfile, updateProfile, deleteAccount, searchUsers, getAllEmployees } from "~/controllers/user.controller";

const userRouter = express.Router();

// All user routes require authentication
userRouter.use(requireAuth);

// Get current user profile
userRouter.get("/me", getProfile);

// Get all employees with warehouse assignments (OWNER only)
userRouter.get("/employees", getAllEmployees);

// Update user profile
userRouter.put("/update", updateProfile);

// Delete user account
userRouter.delete("/delete", deleteAccount);

// Search users by email (for warehouse member invitation)
userRouter.get("/search", searchUsers);

export { userRouter };
