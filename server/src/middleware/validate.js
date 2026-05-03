import { validationResult } from "express-validator";
import { HttpError } from "../utils/httpError.js";

export function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    next(new HttpError(400, "Validation error", result.array()));
    return;
  }
  next();
}

