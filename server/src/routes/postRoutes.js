import { Router } from "express";
import { createPost, deletePost, getPost, listPosts, updatePost } from "../controllers/postController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createPostValidator, updatePostValidator } from "../validators/postValidators.js";

const router = Router();

// public blog/news
router.get("/", listPosts);
router.get("/:id", getPost);

// admin CRUD
router.post("/", requireAuth, requireRole("ADMIN"), createPostValidator, validate, createPost);
router.put("/:id", requireAuth, requireRole("ADMIN"), updatePostValidator, validate, updatePost);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deletePost);

export default router;

