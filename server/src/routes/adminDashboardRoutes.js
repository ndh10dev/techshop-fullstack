import { Router } from "express";
import { getAdminDashboard } from "../controllers/adminDashboardController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/dashboard", requireAuth, requireRole("ADMIN"), getAdminDashboard);

export default router;

