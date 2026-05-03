import { body } from "express-validator";

export const createReviewValidator = [
  body("rating").isInt({ min: 1, max: 5 }),
  body("comment").optional().isString().trim().isLength({ max: 2000 }),
];

