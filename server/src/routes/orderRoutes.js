import { Router } from "express";
import { createOrder, listAllOrders, listMyOrders, listOrdersAdmin } from "../controllers/orderController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createOrderValidator } from "../validators/orderValidators.js";

const router = Router();

router.post("/", requireAuth, createOrderValidator, validate, createOrder);
router.get("/mine", requireAuth, listMyOrders);
router.get("/admin", requireAuth, requireRole("ADMIN"), listOrdersAdmin);

// admin can see all orders
router.get("/", requireAuth, requireRole("ADMIN"), listAllOrders);

export default router;

