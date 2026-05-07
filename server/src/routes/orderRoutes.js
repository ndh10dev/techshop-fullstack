import { Router } from "express";
import {
  createOrder,
  createPosOrder,
  listAllOrders,
  listMyOrders,
  listOrdersAdmin,
  deleteOrder,
  confirmOrderAdmin,
  cancelOrderAdmin,
  markOrderReceived,
  validateCartItemStock,
} from "../controllers/orderController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createOrderValidator, createPosOrderValidator, validateCartItemValidator } from "../validators/orderValidators.js";

const router = Router();

router.post("/", requireAuth, createOrderValidator, validate, createOrder);
router.post("/pos", requireAuth, requireRole("ADMIN"), createPosOrderValidator, validate, createPosOrder);
router.post("/cart/validate", requireAuth, validateCartItemValidator, validate, validateCartItemStock);
router.get("/mine", requireAuth, listMyOrders);
router.get("/admin", requireAuth, requireRole("ADMIN"), listOrdersAdmin);
router.patch("/admin/:id/confirm", requireAuth, requireRole("ADMIN"), confirmOrderAdmin);
router.patch("/admin/:id/cancel", requireAuth, requireRole("ADMIN"), cancelOrderAdmin);
router.patch("/:id/received", requireAuth, requireRole("USER"), markOrderReceived);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteOrder);

// admin can see all orders
router.get("/", requireAuth, requireRole("ADMIN"), listAllOrders);

export default router;

