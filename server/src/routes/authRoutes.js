import { Router } from "express";
import { createAdmin, login, me, register } from "../controllers/authController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createAdminValidator, loginValidator, registerValidator } from "../validators/authValidators.js";

const router = Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", requireAuth, me);

// Admin accounts can ONLY be created by existing admins
router.post("/admin", requireAuth, requireRole("ADMIN"), createAdminValidator, validate, createAdmin);

export default router;

