import { body } from "express-validator";

export const registerValidator = [
  body("username").isString().trim().isLength({ min: 2, max: 100 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 6, max: 100 }),
];

export const loginValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 1 }),
];

export const createAdminValidator = [
  body("username").isString().trim().isLength({ min: 2, max: 100 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 8, max: 100 }),
];

