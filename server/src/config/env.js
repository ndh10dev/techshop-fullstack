import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    name: process.env.DB_NAME ?? "techshop",
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? "dev_secret_change_me",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },
};

