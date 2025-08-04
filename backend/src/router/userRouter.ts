import { Hono } from "hono";
import {
  getUserProfile,
  getUserPosts,
  updateUserProfile,
  toggleFollow,
} from "../controller/userController";
import { requireAuth, optionalAuth } from "../middleware/auth";

export const userRouter = new Hono();

// Public routes
userRouter.get('/:username', optionalAuth,getUserProfile);
userRouter.get('/:username/posts', optionalAuth, getUserPosts);

userRouter.put('/profile', requireAuth, updateUserProfile);
userRouter.post('/follow/:username', requireAuth, toggleFollow);
