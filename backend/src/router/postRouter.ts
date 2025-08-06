import { Hono } from "hono";
import {
  createPost,
  deletePostById,
  getAllPosts,
  getFeed,
  getPostById,
  updatePostById,
} from "../controller/postController";
import { requireAuth, optionalAuth } from "../middleware/auth";
export const postRouter = new Hono();

postRouter.get("/allPosts", optionalAuth, getAllPosts);
postRouter.get('/feed', requireAuth, getFeed);
postRouter.get("/:id", optionalAuth, getPostById);

postRouter.post("/create", requireAuth, createPost);
postRouter.put("/edit/:id", requireAuth, updatePostById);
postRouter.delete("/delete/:id", requireAuth,deletePostById);

