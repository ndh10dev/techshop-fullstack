import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { User } from "../models/User.js";

export async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
    if (!token) return next();

    const payload = jwt.verify(token, env.jwt.secret);
    const user = await User.findByPk(payload.sub, { attributes: ["id", "username", "email", "role"] });
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
    if (!token) throw new HttpError(401, "Missing Authorization Bearer token");

    const payload = jwt.verify(token, env.jwt.secret);
    const user = await User.findByPk(payload.sub, { attributes: ["id", "username", "email", "role"] });
    if (!user) throw new HttpError(401, "Invalid token");

    req.user = user;
    next();
  } catch (err) {
    if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
      next(new HttpError(401, "Invalid or expired token"));
      return;
    }
    next(err);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new HttpError(401, "Unauthorized"));
    if (!roles.includes(req.user.role)) return next(new HttpError(403, "Forbidden"));
    next();
  };
}

