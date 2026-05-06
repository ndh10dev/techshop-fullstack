import { body } from "express-validator";

export const createOrderValidator = [
  body("items").isArray({ min: 1 }),
  body("items.*.productId").isInt({ min: 1 }),
  body("items.*.quantity").isInt({ min: 1 }),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("note").optional({ nullable: true }).isString(),
];

export const createPosOrderValidator = [
  body("items").isArray({ min: 1 }),
  body("items.*.productId").isInt({ min: 1 }),
  body("items.*.quantity").isInt({ min: 1 }),
  body("customerName").optional({ nullable: true }).isString(),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("address").optional({ nullable: true }).isString(),
  body("note").optional({ nullable: true }).isString(),
  body("paymentMethod")
    .optional({ nullable: true })
    .isIn(["CASH", "BANK_TRANSFER", "EWALLET"])
    .withMessage("Invalid payment method"),
];

