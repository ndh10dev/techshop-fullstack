import { sequelize } from "../config/sequelize.js";
import { DataTypes } from "sequelize";

export async function ensureProductColumns() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable("products");

  if (!table.detailed_description) {
    await queryInterface.addColumn("products", "detailed_description", {
      type: DataTypes.TEXT,
      allowNull: true,
      after: "description",
    });
  }

  if (!table.usage_instructions) {
    await queryInterface.addColumn("products", "usage_instructions", {
      type: DataTypes.TEXT,
      allowNull: true,
      after: "detailed_description",
    });
  }

  if (!table.storage_instructions) {
    await queryInterface.addColumn("products", "storage_instructions", {
      type: DataTypes.TEXT,
      allowNull: true,
      after: "usage_instructions",
    });
  }

  if (!table.stock_quantity) {
    await queryInterface.addColumn("products", "stock_quantity", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: "quantity",
    });
    await sequelize.query("UPDATE products SET stock_quantity = quantity WHERE stock_quantity = 0");
  }
}

async function runDirectly() {
  try {
    await sequelize.authenticate();
    await ensureProductColumns();
    // eslint-disable-next-line no-console
    console.log("products table columns ensured: detailed_description, usage_instructions, storage_instructions, stock_quantity");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to ensure product columns:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

const isDirectRun = process.argv[1]?.endsWith("ensureProductColumns.js");
if (isDirectRun) {
  runDirectly();
}

