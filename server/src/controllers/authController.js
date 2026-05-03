import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, username: user.username, email: user.email },
    env.jwt.secret,
    { subject: String(user.id), expiresIn: env.jwt.expiresIn }
  );
}

export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new HttpError(409, "Email already in use");

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role: "USER" });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) throw new HttpError(401, "Wrong email or password");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new HttpError(401, "Wrong email or password");

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export async function createAdmin(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new HttpError(409, "Email already in use");

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role: "ADMIN" });

    res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
}

