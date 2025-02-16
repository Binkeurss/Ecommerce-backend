const mongoose = require("mongoose");

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

const inventorySchema = new mongoose.Schema(
  {
    inventory_productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    inventory_location: { type: String, default: "Unknown" },
    inventory_stock: { type: Number, required: true },
    inventory_shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    // Khi người dùng đặt một sản phẩm => lưu vào inventory_reservations và sẽ xử lý logic
    inventory_reservations: { type: Array, default: [] },
    /**
     * cartId
     * stock: 1
     * createOn
     */
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = {
  inventoryModel: mongoose.model(DOCUMENT_NAME, inventorySchema),
};
