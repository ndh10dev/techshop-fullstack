import { User } from "./User.js";
import { Product } from "./Product.js";
import { Order } from "./Order.js";
import { OrderItem } from "./OrderItem.js";
import { Review } from "./Review.js";
import { Post } from "./Post.js";
import { Contact } from "./Contact.js";

// Associations
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

User.hasMany(Review, { foreignKey: "userId" });
Review.belongsTo(User, { foreignKey: "userId" });

Product.hasMany(Review, { foreignKey: "productId" });
Review.belongsTo(Product, { foreignKey: "productId" });

export { User, Product, Order, OrderItem, Review, Post, Contact };