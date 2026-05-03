import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export class OrderItem extends Model {}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "order_id" },
    productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "product_id" },
    quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "order_items",
    timestamps: false,
  }
);

