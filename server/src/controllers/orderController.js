import { sequelize } from "../config/sequelize.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

export async function createOrder(req, res, next) {
  const { items } = req.body;

  try {
    const result = await sequelize.transaction(async (t) => {
      // Lock products so quantity changes are safe
      const productIds = [...new Set(items.map((i) => i.productId))];
      const products = await Product.findAll({
        where: { id: productIds },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (products.length !== productIds.length) {
        throw new HttpError(400, "One or more products not found");
      }

      const byId = new Map(products.map((p) => [p.id, p]));

      let total = 0;
      for (const item of items) {
        const product = byId.get(item.productId);
        if (!product) throw new HttpError(400, "One or more products not found");
        if (product.quantity < item.quantity) {
          throw new HttpError(400, `Insufficient quantity for product ${product.id}`);
        }
        total += Number(product.price) * item.quantity;
      }

      const order = await Order.create(
        { userId: req.user.id, totalPrice: total, status: "PENDING" },
        { transaction: t }
      );

      for (const item of items) {
        const product = byId.get(item.productId);
        await OrderItem.create(
          {
            orderId: order.id,
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
          },
          { transaction: t }
        );

        await product.update({ quantity: product.quantity - item.quantity }, { transaction: t });
      }

      const created = await Order.findByPk(order.id, {
        include: [{ model: OrderItem, as: "items" }],
        transaction: t,
      });

      return created;
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, as: "items" }],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function deleteOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);

    if (!order) {
      throw new HttpError(404, "Order not found");
    }

    // Delete associated OrderItems first if not using CASCADE (Sequelize usually needs this if not defined)
    await OrderItem.destroy({ where: { orderId: id } });
    await order.destroy();

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    next(err);
  }
}

export async function listOrdersAdmin(req, res, next) {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          attributes: ["username", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function listAllOrders(req, res, next) {
  try {
    const orders = await Order.findAll({
      include: [{ model: OrderItem, as: "items" }],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

