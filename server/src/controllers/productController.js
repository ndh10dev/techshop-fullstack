import { Op } from "sequelize";
import { Product } from "../models/Product.js";
import { HttpError } from "../utils/httpError.js";

function normalizeStockPayload(payload) {
  const next = { ...payload };
  if (next.stockQuantity !== undefined) {
    const normalized = Number(next.stockQuantity);
    next.stockQuantity = normalized;
    next.quantity = normalized;
  } else if (next.quantity !== undefined) {
    const normalized = Number(next.quantity);
    next.quantity = normalized;
    next.stockQuantity = normalized;
  }
  return next;
}

export async function listProducts(req, res, next) {
  try {
    const where = {};
    if (!req.user || req.user.role !== "ADMIN") {
      where.stockQuantity = { [Op.gt]: 0 };
    }
    const products = await Product.findAll({ where, order: [["id", "DESC"]] });
    res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new HttpError(404, "Product not found");

    if ((!req.user || req.user.role !== "ADMIN") && product.stockQuantity <= 0) {
      throw new HttpError(404, "Product not found");
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await Product.create(normalizeStockPayload(req.body));
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new HttpError(404, "Product not found");

    await product.update(normalizeStockPayload(req.body));
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new HttpError(404, "Product not found");

    await product.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

