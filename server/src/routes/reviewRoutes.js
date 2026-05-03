// server/src/routes/reviewRoutes.js
import express from "express";
import { listReviews, createReview } from "../controllers/reviewController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", listReviews);// ai cũng xem được
router.post("/", createReview); // phải login mới đăng

export default router;