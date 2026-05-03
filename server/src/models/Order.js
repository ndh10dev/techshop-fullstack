import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export class Order extends Model {}

Order.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "user_id" },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: "total_price" },
    status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "PENDING" },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: "created_at" },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: false,
  }
);

