import { sequelize } from "../config/sequelize.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { ORDER_STATUS } from "../constants/orderStatus.js";

function getProductStock(product) {
  return Number(product.stockQuantity ?? product.quantity ?? 0);
}

export async function createOrder(req, res, next) {
  const { items, phone, address, note } = req.body;

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
        const stock = getProductStock(product);
        if (stock < item.quantity) {
          throw new HttpError(400, "Sản phẩm vượt quá tồn kho");
        }
        total += Number(product.price) * item.quantity;
      }

      const order = await Order.create(
        {
          userId: req.user.id,
          phone,
          address,
          note: note || null,
          paymentMethod: "CASH",
          totalPrice: total,
          status: ORDER_STATUS.PENDING,
        },
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

        const stock = getProductStock(product);
        const nextStock = stock - item.quantity;
        await product.update({ stockQuantity: nextStock, quantity: nextStock }, { transaction: t });
      }

      const created = await Order.findByPk(order.id, {
        include: [
          {
            model: OrderItem,
            as: "items",
            include: [{ model: Product, attributes: ["name", "image"] }],
          },
        ],
        transaction: t,
      });

      return created;
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function createPosOrder(req, res, next) {
  const { items, customerName, phone, address, note, paymentMethod } = req.body;

  try {
    const result = await sequelize.transaction(async (t) => {
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
        const stock = getProductStock(product);
        if (stock < item.quantity) {
          throw new HttpError(400, "Sản phẩm vượt quá tồn kho");
        }
        total += Number(product.price) * item.quantity;
      }

      const order = await Order.create(
        {
          userId: req.user.id,
          customerName: customerName || null,
          phone,
          address: address || null,
          note: note || null,
          paymentMethod: paymentMethod || "CASH",
          totalPrice: total,
          status: ORDER_STATUS.PENDING,
        },
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

        const stock = getProductStock(product);
        const nextStock = stock - item.quantity;
        await product.update({ stockQuantity: nextStock, quantity: nextStock }, { transaction: t });
      }

      const created = await Order.findByPk(order.id, {
        include: [
          {
            model: OrderItem,
            as: "items",
            include: [{ model: Product, attributes: ["name", "image"] }],
          },
        ],
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
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, attributes: ["name", "image"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function confirmOrderAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) throw new HttpError(404, "Order not found");

    if (order.status !== ORDER_STATUS.PENDING) {
      throw new HttpError(400, "Only pending orders can be confirmed");
    }

    await order.update({ status: ORDER_STATUS.SHIPPING });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function cancelOrderAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: "items" }],
    });
    if (!order) throw new HttpError(404, "Order not found");

    if (order.status === ORDER_STATUS.COMPLETED) {
      throw new HttpError(400, "Completed orders cannot be cancelled");
    }
    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new HttpError(400, "Order is already cancelled");
    }

    await sequelize.transaction(async (t) => {
      const productIds = [...new Set(order.items.map((item) => item.productId))];
      const products = await Product.findAll({
        where: { id: productIds },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      const byId = new Map(products.map((p) => [p.id, p]));

      for (const item of order.items) {
        const product = byId.get(item.productId);
        if (!product) continue;
        const stock = getProductStock(product);
        const nextStock = stock + item.quantity;
        await product.update({ stockQuantity: nextStock, quantity: nextStock }, { transaction: t });
      }

      await order.update({ status: ORDER_STATUS.CANCELLED }, { transaction: t });
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function validateCartItemStock(req, res, next) {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) throw new HttpError(404, "Product not found");

    const stock = getProductStock(product);
    if (quantity > stock) {
      throw new HttpError(400, "Sản phẩm vượt quá tồn kho");
    }

    res.json({ ok: true, stockQuantity: stock });
  } catch (err) {
    next(err);
  }
}

export async function markOrderReceived(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) throw new HttpError(404, "Order not found");

    if (order.userId !== req.user.id) {
      throw new HttpError(403, "Forbidden");
    }
    if (order.status !== ORDER_STATUS.SHIPPING) {
      throw new HttpError(400, "Only shipping orders can be marked as received");
    }

    await order.update({ status: ORDER_STATUS.COMPLETED });
    res.json(order);
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
              attributes: ["name", "image"],
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

