"use strict";

const mongoose = require("mongoose");

const DOCUMENT_NAME = "Order";
const COLLECTION_NAME = "Orders";

const orderSchema = new mongoose.Schema(
  {
    order_userId: { type: Number, required: true },
    order_checkout: { type: Object, required: true }, // Thông tin về đơn hàng
    /**
     * order_checkout = {
     *  totalPrice,
     *  feeShip,
     *  totalDiscount,
     *  totalCheckout
     * }
     */
    order_shipping: { type: Object, required: true, default: {} },
    /**
     * street,
     * city,
     * country
     */
    order_payment: { type: Object, required: true, default: {} },
    order_products: { type: Array, require: true, default: [] }, // shop_order_ids_new: Sau khi check các sản phẩm và áp dụng discount
    order_trackingNumber: { type: String, default: "#000120022025" },
    order_status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "cancelled", "delivered"],
      default: "pending",
    },
  },
  {
    collation: COLLECTION_NAME,
    timestamps: true,
  }
);

module.exports = {
  orderModel: new mongoose.model(DOCUMENT_NAME, orderSchema),
};
