import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export class Post extends Model {}

Post.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    excerpt: { type: DataTypes.TEXT, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    fullContent: { type: DataTypes.TEXT("long"), allowNull: true, field: "full_content" },
    image: { type: DataTypes.STRING(2048), allowNull: true },
    category: { type: DataTypes.STRING(100), allowNull: true },
    date: { type: DataTypes.STRING(50), allowNull: true },
    author: { type: DataTypes.STRING(255), allowNull: true },
    readTime: { type: DataTypes.STRING(50), allowNull: true, field: "read_time" },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: "created_at" },
  },
  {
    sequelize,
    modelName: "Post",
    tableName: "posts",
    timestamps: false,
  }
);

