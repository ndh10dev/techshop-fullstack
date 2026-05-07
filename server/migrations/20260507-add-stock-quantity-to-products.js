export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable("products");
  if (!table.stock_quantity) {
    await queryInterface.addColumn("products", "stock_quantity", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: "quantity",
    });
    await queryInterface.sequelize.query(
      "UPDATE products SET stock_quantity = quantity WHERE stock_quantity = 0"
    );
  }
}

export async function down(queryInterface) {
  const table = await queryInterface.describeTable("products");
  if (table.stock_quantity) {
    await queryInterface.removeColumn("products", "stock_quantity");
  }
}
