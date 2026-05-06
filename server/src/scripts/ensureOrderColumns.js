import { sequelize } from "../config/sequelize.js";
import { DataTypes } from "sequelize";

export async function ensureOrderColumns() {
  const queryInterface = sequelize.getQueryInterface();
  const table = await queryInterface.describeTable("orders");

  if (!table.phone) {
    await queryInterface.addColumn("orders", "phone", {
      type: DataTypes.STRING(20),
      allowNull: true,
      after: "user_id",
    });
  }

  if (!table.address) {
    await queryInterface.addColumn("orders", "address", {
      type: DataTypes.TEXT,
      allowNull: true,
      after: "phone",
    });
  }

  if (!table.note) {
    await queryInterface.addColumn("orders", "note", {
      type: DataTypes.TEXT,
      allowNull: true,
      after: "address",
    });
  }

  if (!table.customer_name) {
    await queryInterface.addColumn("orders", "customer_name", {
      type: DataTypes.STRING(255),
      allowNull: true,
      after: "user_id",
    });
  }

  if (!table.payment_method) {
    await queryInterface.addColumn("orders", "payment_method", {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "CASH",
      after: "note",
    });
  }
}

async function runDirectly() {
  try {
    await sequelize.authenticate();
    await ensureOrderColumns();
    // eslint-disable-next-line no-console
    console.log("orders table columns ensured: phone, address, note, customer_name, payment_method");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to ensure order columns:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

const isDirectRun = process.argv[1]?.endsWith("ensureOrderColumns.js");
if (isDirectRun) {
  runDirectly();
}
