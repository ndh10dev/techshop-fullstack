import app from "./app.js";
import { env } from "./config/env.js";
import { assertDbConnection } from "./config/sequelize.js";
import { ensureOrderColumns } from "./scripts/ensureOrderColumns.js";
import "./models/index.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const PORT = env.port;

//GẮN ROUTE VÀO APP
app.use("/api/reviews", reviewRoutes);

async function bootstrap() {
  await assertDbConnection();
  await ensureOrderColumns();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});