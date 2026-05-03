import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export class Review extends Model {}

Review.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "customer_name",
    },

    rating: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    sequelize,
    modelName: "Review",
    tableName: "reviews",
    timestamps: false,
  }
);