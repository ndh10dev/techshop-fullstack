import { body } from "express-validator";

export const createProductValidator = [
  body("name").isString().trim().isLength({ min: 2, max: 255 }),
  body("description").isString().trim().isLength({ min: 5 }),
  body("detailedDescription").optional({ nullable: true }).isString().trim().isLength({ min: 1 }),
  body("usageInstructions").optional({ nullable: true }).isString().trim().isLength({ min: 1 }),
  body("storageInstructions").optional({ nullable: true }).isString().trim().isLength({ min: 1 }),
  body("price").isFloat({ gt: 0 }),
  body("image").isString().trim().isLength({ min: 1, max: 2048 }),
  body("brand").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 255 }),
  body("rating").optional().isInt({ min: 0, max: 5 }),
  body("quantity").optional().isInt({ min: 0 }),
  body("stockQuantity").optional().isInt({ min: 0 }),
  body("category").isString().trim().isLength({ min: 1, max: 100 }),
];

export const updateProductValidator = [
  body("name").optional().isString().trim().isLength({ min: 2, max: 255 }),
  body("description").optional().isString().trim().isLength({ min: 5 }),
  body("detailedDescription").optional({ nullable: true }).isString().trim().isLength({ min: 1 }),
  body("usageInstructions").optional({ nullable: true }).isString().trim().isLength({ min: 1 }),
  body("storageInstructions").optional({ nullable: true }).isString().trim().isLength({ min: 1 }),
  body("price").optional().isFloat({ gt: 0 }),
  body("image").optional().isString().trim().isLength({ min: 1, max: 2048 }),
  body("brand").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 255 }),
  body("rating").optional().isInt({ min: 0, max: 5 }),
  body("quantity").optional().isInt({ min: 0 }),
  body("stockQuantity").optional().isInt({ min: 0 }),
  body("category").optional().isString().trim().isLength({ min: 1, max: 100 }),
];

