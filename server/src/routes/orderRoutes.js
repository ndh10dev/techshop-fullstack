import { Router } from "express";
import { createOrder, createPosOrder, listAllOrders, listMyOrders, listOrdersAdmin, deleteOrder } from "../controllers/orderController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createOrderValidator, createPosOrderValidator } from "../validators/orderValidators.js";

const router = Router();

router.post("/", requireAuth, createOrderValidator, validate, createOrder);
router.post("/pos", requireAuth, requireRole("ADMIN"), createPosOrderValidator, validate, createPosOrder);
router.get("/mine", requireAuth, listMyOrders);
router.get("/admin", requireAuth, requireRole("ADMIN"), listOrdersAdmin);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteOrder);

// admin can see all orders
router.get("/", requireAuth, requireRole("ADMIN"), listAllOrders);

export default router;

