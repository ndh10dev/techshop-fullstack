import { body } from "express-validator";

export const createOrderValidator = [
  body("items").isArray({ min: 1 }),
  body("items.*.productId").isInt({ min: 1 }),
  body("items.*.quantity").isInt({ min: 1 }),
];

