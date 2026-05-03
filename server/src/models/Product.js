import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export class Product extends Model {}

Product.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    image: { type: DataTypes.STRING(2048), allowNull: false },
    brand: { type: DataTypes.STRING(255), allowNull: true },
    rating: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    category: { type: DataTypes.STRING(100), allowNull: false },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: false,
  }
);

