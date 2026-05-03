import { Router } from "express";
import reviewRoutes from "./reviewRoutes.js";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../controllers/productController.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createProductValidator, updateProductValidator } from "../validators/productValidators.js";

const router = Router();

// Nested reviews (must come before "/:id")
router.use("/:productId/reviews", reviewRoutes);

// Public browse (guests see only quantity > 0)
router.get("/", optionalAuth, listProducts);
router.get("/:id", optionalAuth, getProduct);

// Admin CRUD
router.post("/", requireAuth, requireRole("ADMIN"), createProductValidator, validate, createProduct);
router.put("/:id", requireAuth, requireRole("ADMIN"), updateProductValidator, validate, updateProduct);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteProduct);

export default router;

