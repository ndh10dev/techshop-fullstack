import { HttpError } from "../utils/httpError.js";

export function notFoundHandler(req, res, next) {
  next(new HttpError(404, "Route not found"));
}

export function errorHandler(err, req, res, next) {
  const statusCode = err?.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({
    message: err?.message ?? "Internal Server Error",
    details: err?.details,
  });
}

