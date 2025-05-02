"use strict";

const mongoose = require("mongoose");

const DOCUMENT_NAME = "DetailCart";
const COLLECTION_NAME = "DetailCarts";

const detailCartSchema = new mongoose.Schema(
  {
    detailCart_ShopId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    detailCart_productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    detailCart_CartId: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
    detailCart_quantity: { type: Number, default: 0 },
    detailCart_unitPrice: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = {
  detailCartModel: mongoose.model(DOCUMENT_NAME, detailCartSchema),
};
