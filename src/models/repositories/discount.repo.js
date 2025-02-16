"use strict";

const discountModel = require("../discount.model");

const findDiscountCodeByCodeAndShopId = async ({ discount_code, shopId }) => {
  const foundDiscount = await discountModel.findOne({
    discount_code: discount_code,
    discount_shopId: shopId,
  });
  return foundDiscount;
};

const createDiscountCode = async ({
  discount_name,
  discount_description,
  discount_type,
  discount_value,
  discount_max_value,
  discount_code,
  discount_start_date,
  discount_end_date,
  discount_max_uses,
  discount_uses_count,
  discount_max_uses_per_user,
  discount_min_order_value,
  discount_shopId,
  discount_is_active,
  discount_applies_to,
  discount_product_ids,
}) => {
  const newDiscount = discountModel.create({
    discount_name,
    discount_description,
    discount_type,
    discount_value,
    discount_max_value,
    discount_code,
    discount_start_date,
    discount_end_date,
    discount_max_uses,
    discount_uses_count,
    discount_max_uses_per_user,
    discount_min_order_value,
    discount_shopId,
    discount_is_active,
    discount_applies_to,
    discount_product_ids,
  });
  return newDiscount;
};

const updateDiscountCodeById = async ({ discount_id, payload }) => {
  const newDiscountCode = await discountModel.findByIdAndUpdate(
    discount_id,
    payload,
    { new: true }
  );
  return newDiscountCode;
};

const findDiscountCodeById = async ({ discount_id }) => {
  const foundDiscountCode = await discountModel.findById(discount_id);
  return foundDiscountCode;
};

const findDiscountCodeByFilter = async (filters) => {
  if (!filters || typeof filters !== "object") {
    throw new Error("Filters must be an object!");
  }

  let queryFiltes = {};

  // Build filter object dynamically
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== undefined && filters[key] !== null) {
      queryFiltes[key] = filters[key];
    }
  });

  const foundDiscountCode = await discountModel.findOne(queryFiltes);
  return foundDiscountCode;
};

const findAllDiscountsShop = async ({ limit, sort, skip, filter, select }) => {
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const listDiscoutns = await discountModel
    .find({ discount_shopId: filter })
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(select);
  return listDiscoutns;
};

const softDeleteDiscountCode = async ({ id }) => {
  let foundDiscount = await discountModel.findById(id);
  foundDiscount.is_deleted = true;
  foundDiscount.discount_is_active = false;
  foundDiscount.save();
  return foundDiscount;
};

module.exports = {
  findDiscountCodeByCodeAndShopId,
  createDiscountCode,
  updateDiscountCodeById,
  findDiscountCodeById,
  findDiscountCodeByFilter,
  findAllDiscountsShop,
  softDeleteDiscountCode,
};
