import { Op } from "sequelize";
import { sequelize } from "../config/sequelize.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import { Product } from "../models/Product.js";
import { ORDER_STATUS } from "../constants/orderStatus.js";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatYmd(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getAdminDashboard(req, res, next) {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrowStart = addDays(todayStart, 1);

    const sevenDaysStart = addDays(todayStart, -6); // inclusive (today + 6 previous)

    const [
      todayOrders,
      todayRevenueRow,
      pendingCount,
      shippingCount,
      totalProducts,
      topProducts,
      revenueRows,
    ] = await Promise.all([
      Order.count({
        where: {
          createdAt: { [Op.gte]: todayStart, [Op.lt]: tomorrowStart },
        },
      }),
      Order.findOne({
        attributes: [[sequelize.fn("SUM", sequelize.col("total_price")), "revenue"]],
        where: {
          status: ORDER_STATUS.COMPLETED,
          createdAt: { [Op.gte]: todayStart, [Op.lt]: tomorrowStart },
        },
        raw: true,
      }),
      Order.count({ where: { status: ORDER_STATUS.PENDING } }),
      Order.count({ where: { status: ORDER_STATUS.SHIPPING } }),
      Product.count(),
      OrderItem.findAll({
        attributes: [
          "productId",
          [sequelize.fn("SUM", sequelize.col("OrderItem.quantity")), "soldQty"],
        ],
        include: [
          { model: Order, attributes: [], where: { status: ORDER_STATUS.COMPLETED }, required: true },
          { model: Product, attributes: ["id", "name", "image", "price"], required: true },
        ],
        group: ["product_id", "Product.id"],
        order: [[sequelize.literal("soldQty"), "DESC"]],
        limit: 5,
        raw: false,
      }),
      Order.findAll({
        attributes: [
          [sequelize.fn("DATE", sequelize.col("created_at")), "day"],
          [sequelize.fn("SUM", sequelize.col("total_price")), "revenue"],
        ],
        where: {
          status: ORDER_STATUS.COMPLETED,
          createdAt: { [Op.gte]: sevenDaysStart, [Op.lt]: tomorrowStart },
        },
        group: [sequelize.fn("DATE", sequelize.col("created_at"))],
        order: [[sequelize.literal("day"), "ASC"]],
        raw: true,
      }),
    ]);

    const todayRevenue = Number(todayRevenueRow?.revenue ?? 0);

    const revenueByDay = new Map();
    for (const row of revenueRows) {
      const dayKey = String(row.day);
      revenueByDay.set(dayKey, Number(row.revenue ?? 0));
    }

    const revenue7Days = [];
    for (let i = 0; i < 7; i += 1) {
      const d = addDays(sevenDaysStart, i);
      const key = formatYmd(d);
      revenue7Days.push({ day: key, revenue: revenueByDay.get(key) ?? 0 });
    }

    res.json({
      todayRevenue,
      todayOrders,
      pendingCount,
      shippingCount,
      totalProducts,
      topProducts: topProducts.map((row) => ({
        productId: row.productId,
        soldQty: Number(row.get("soldQty") ?? 0),
        product: row.Product,
      })),
      revenue7Days,
    });
  } catch (err) {
    next(err);
  }
}

