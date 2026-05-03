import { sequelize } from "../config/sequelize.js";
import "../models/index.js";

async function main() {
  await sequelize.sync({ alter: true });
  // eslint-disable-next-line no-console
  console.log("DB sync complete");
  await sequelize.close();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

