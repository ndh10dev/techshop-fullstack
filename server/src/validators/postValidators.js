import { body } from "express-validator";

export const createPostValidator = [
  body("title").isString().trim().isLength({ min: 3, max: 255 }),
  body("excerpt").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 2000 }),
  body("content").isString().trim().isLength({ min: 10 }),
  body("fullContent").optional({ nullable: true }).isString().isLength({ min: 1 }),
  body("image").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 2048 }),
  body("category").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 100 }),
  body("date").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 50 }),
  body("author").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 255 }),
  body("readTime").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 50 }),
];

export const updatePostValidator = [
  body("title").optional().isString().trim().isLength({ min: 3, max: 255 }),
  body("excerpt").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 2000 }),
  body("content").optional().isString().trim().isLength({ min: 10 }),
  body("fullContent").optional({ nullable: true }).isString().isLength({ min: 1 }),
  body("image").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 2048 }),
  body("category").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 100 }),
  body("date").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 50 }),
  body("author").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 255 }),
  body("readTime").optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 50 }),
];

