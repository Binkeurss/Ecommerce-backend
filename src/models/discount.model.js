"use strict";

const mongoose = require("mongoose");

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";

const discountSchema = new mongoose.Schema(
  {
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true },
    discount_type: {
      type: String,
      default: "fixed_amount",
      enum: ["fixed_amount", "percentage"],
    },
    discount_value: { type: Number, required: true }, // 10.000, 10
    discount_max_value: { type: Number, required: true }, // Số tiền giảm giá tối đa
    discount_code: { type: String, required: true }, //discountCode
    discount_start_date: { type: Date, required: true }, // Ngày bắt đầu
    discount_end_date: { type: Date, required: true }, // Ngày kết thúc
    discount_max_uses: { type: Number, required: true }, // Số lượng discount được áp dụng
    discount_uses_count: { type: Number, required: true }, // Số lượng discount đã sử dụng
    discount_users_count: { type: Array, default: [] }, // Ai đã sử dụng
    discount_max_uses_per_user: { type: Number, required: true }, // Số lượng cho phép tối đa dùng discount của 1 người
    discount_min_order_value: { type: Number, required: true }, // Số tiền tối thiểu của order để áp dụng discount_applies_to
    discount_shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    discount_is_active: { type: Boolean, default: true },
    discount_applies_to: {
      type: String,
      required: true,
      enum: ["all", "specific"],
    },
    discount_product_ids: { type: Array, default: [] }, // specific - Những sản phẩm được áp dụng
    is_deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, discountSchema);
