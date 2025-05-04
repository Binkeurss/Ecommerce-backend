"use strict";

const mongoose = require("mongoose");
/*
  1. Generator Discount Code [Shop | Admin]
  2. Get all discount codes [User | Shop]
  3. Get all products by discount code [User]
  4. Get discount amount [User]
  5. Delete discount Code [Admin | Shop]
  6. Cancel discount Code [User]
*/
const { BadRequestError, NotFoundError } = require("../core/error.response");
const {
  findDiscountCodeByCodeAndShopId,
  createDiscountCode,
  updateDiscountCodeById,
  findDiscountCodeById,
  findDiscountCodeByFilter,
  findAllDiscountsShop,
  softDeleteDiscountCode,
} = require("../models/repositories/discount.repo");
const {
  findAllProducts,
  findProductById,
} = require("../models/repositories/product.repo");

const { removeUndefinedNullObject } = require("../utils");
const discountModel = require("../models/discount.model");
const {
  findProductItemByDetailCartId,
} = require("../models/repositories/detailCart.repo");

class discountService {
  static async createDiscountCode(payload) {
    const {
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
    } = payload;
    // Convert all dates to UTC for consistent comparison
    const currentDate = new Date();
    const startDate = new Date(discount_start_date);
    const endDate = new Date(discount_end_date);

    if (currentDate >= endDate) {
      throw new BadRequestError("Discount code has expired!");
    }
    if (startDate >= endDate) {
      throw new BadRequestError("Start date must be before End date!");
    }
    //Check discount code exists
    const foundDiscount = await findDiscountCodeByCodeAndShopId({
      discount_code: discount_code,
      discount_shopId: discount_shopId,
    });
    if (foundDiscount) {
      throw new BadRequestError("Discount code already exists!");
    }
    // Validate numeric values
    if (!Number.isFinite(discount_value) || discount_value < 0) {
      throw new BadRequestError("Invalid discount value!");
    }

    if (!Number.isFinite(discount_max_value) || discount_max_value < 0) {
      throw new BadRequestError("Invalid maximum discount value!");
    }

    if (
      !Number.isFinite(discount_min_order_value) ||
      discount_min_order_value < 0
    ) {
      throw new BadRequestError("Invalid minimum order value!");
    }
    if (discount_type === "percentage" && discount_value > 100) {
      throw new BadRequestError(
        `Invalid discount value (discount type: ${discount_type})`
      );
    }

    //check discount_applies_to
    if (discount_applies_to == "specific") {
      if (discount_product_ids.length === 0) {
        throw new BadRequestError(`None products cant apply this discount!`);
      }
      for (let i = 0; i < discount_product_ids.length; i++) {
        const foundProduct = await findProductById({
          product_id: discount_product_ids[i],
        });
        if (!foundProduct) {
          throw new NotFoundError(
            `Product is not existed! (id: ${discount_product_ids[i]})`
          );
        }
        if (
          foundProduct.product_shop.toString() !== discount_shopId.toString()
        ) {
          throw new NotFoundError(
            `Product is not existed in shop! (id: ${discount_product_ids[i]})`
          );
        }
      }
    }

    const newDiscount = await createDiscountCode({
      discount_name: discount_name,
      discount_description: discount_description,
      discount_type: discount_type,
      discount_value: discount_value,
      discount_max_value: discount_max_value,
      discount_code: discount_code,
      discount_start_date: startDate,
      discount_end_date: endDate,
      discount_max_uses: discount_max_uses,
      discount_uses_count: discount_uses_count,
      discount_max_uses_per_user: discount_max_uses_per_user,
      discount_min_order_value: discount_min_order_value,
      discount_shopId: discount_shopId,
      discount_is_active: discount_is_active,
      discount_applies_to: discount_applies_to,
      discount_product_ids: discount_product_ids,
    });
    return newDiscount;
  }

  static async updateDiscountCode(discount_id, payload) {
    let validPayload = removeUndefinedNullObject(payload);
    console.log("validPayload: ", validPayload);
    let foundDiscount = await findDiscountCodeById({ discount_id });
    // check discount code
    if (validPayload.discount_code) {
      let findDiscount = await findDiscountCodeByFilter({
        discount_code: validPayload.discount_code,
      });
      if (!mongoose.Types.ObjectId.isValid(discount_id)) {
        throw new BadRequestError("Invalid discount ID format");
      }

      if (findDiscount && findDiscount._id.toString() !== discount_id) {
        throw new BadRequestError(
          "Discount code already exists! - validate Payload"
        );
      }
    }
    // check date
    if (validPayload.discount_start_date || validPayload.discount_end_date) {
      let currentDate = new Date();
      let startDate = {};
      let endDate = {};
      if (validPayload.discount_start_date && validPayload.discount_end_date) {
        startDate = new Date(validPayload.discount_start_date);
        endDate = new Date(validPayload.discount_end_date);
      } else if (validPayload.discount_start_date) {
        startDate = new Date(validPayload.discount_start_date);
        endDate = foundDiscount.discount_end_date;
      } else {
        startDate = foundDiscount.discount_start_date;
        endDate = new Date(validPayload.discount_end_date);
      }
      if (currentDate >= endDate) {
        throw new BadRequestError(
          "Discount code has expired! - validate Payload"
        );
      }
      if (startDate >= endDate) {
        throw new BadRequestError(
          "Start date must be before End date! - validate Payload"
        );
      }
    }
    // check discount type && discount_value
    if (validPayload.discount_type || validPayload.discount_value) {
      let newDiscount_type = validPayload.discount_type
        ? validPayload.discount_type
        : foundDiscount.discount_type;
      let newDiscount_value = validPayload.discount_value
        ? validPayload.discount_value
        : foundDiscount.discount_value;
      if (newDiscount_type === "percentage" && newDiscount_value >= 100) {
        throw new BadRequestError(
          `Invalid discount value (discount type: ${newDiscount_type}) - validate Payload`
        );
      }
    }

    // check discount_applies_to
    if (validPayload.discount_applies_to) {
      if (validPayload.discount_applies_to === "all") {
        validPayload.discount_product_ids = [];
      }
    }

    // update
    let updateDiscount = await updateDiscountCodeById({
      discount_id: discount_id,
      payload: validPayload,
    });
    return updateDiscount;
  }

  static async getAllDiscountsShop({ limit, skip, sort, shopId, select }) {
    const listDiscounts = await findAllDiscountsShop({
      limit,
      skip,
      sort,
      filter: shopId,
      select,
    });
    return listDiscounts;
  }

  static async getAllProdutsDiscount({
    discount_code,
    shopId,
    userId,
    limit,
    skip,
  }) {
    const foundDiscount = await findDiscountCodeByCodeAndShopId({
      discount_code: discount_code,
      shopId: shopId,
    });
    if (!foundDiscount)
      throw new NotFoundError("Discount code is not existed!");
    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products = {};
    if (discount_applies_to === "all") {
      products = await findAllProducts({
        limit: limit,
        skip: skip,
        filter: {
          product_shop: shopId,
          isPublished: true,
        },
      });
    } else if (discount_applies_to === "specific") {
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        skip: +skip,
      });
    }
    return products;
  }

  // Get discount code amount === apply code
  static async postDiscountAmount({ discount_code, userId, shopId, products }) {
    const foundDiscount = await findDiscountCodeByCodeAndShopId({
      discount_code: discount_code,
      shopId: shopId,
    });
    if (!foundDiscount) throw new NotFoundError("Discount is not existed!");
    // get list detail cart
    // products: [detailCartId] {list}
    let productList = [];
    for (let i = 0; i < products.length; i++) {
      const foundProduct = await findProductItemByDetailCartId({
        detailCartId: products[i],
      });
      if (!foundProduct) {
        throw new NotFoundError("Product is not existed in Shop!");
      }
      if (foundProduct.detailCart_ShopId.toString() !== shopId.toString()) {
        throw new BadRequestError("Product is not belong to Shop!");
      }
      productList.push(foundProduct);
    }

    const {
      discount_is_active,
      discount_end_date,
      discount_start_date,
      discount_min_order_value,
      discount_max_uses,
      discount_uses_count,
      discount_max_uses_per_user,
      discount_users_count,
      discount_value,
      discount_max_value,
      discount_type,
      discount_product_ids,
      discount_applies_to,
    } = foundDiscount;

    // check active
    if (!discount_is_active)
      throw new BadRequestError("Discount is not active!");

    // check date
    if (new Date() < new Date(discount_start_date))
      throw new BadRequestError("Discount code is not started!");
    if (new Date() > new Date(discount_end_date))
      throw new BadRequestError("Discount code is expired!");

    // check discount code can uses
    if (discount_max_uses > 0) {
      if (discount_max_uses <= discount_uses_count)
        throw new BadRequestError("Discount code has expired (max uses)!");
      let user_use_count = discount_users_count.reduce((total, user) => {
        return total + (user === userId ? 1 : 0);
      }, 0);
      if (user_use_count === discount_max_uses_per_user)
        throw new BadRequestError("User has used all the discount code turns!");
    }

    // check can use discount for product
    if (discount_applies_to === "specific") {
      for (let i = 0; i < productList.length; i++) {
        if (!discount_product_ids.includes(productList[i].detailCart_productId))
          throw new NotFoundError(
            `This product can not use this discount! (id: ${productList[i].detailCart_productId})`
          );
      }
    }

    // check min order
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = productList.reduce((total, product) => {
        return (
          total + product.detailCart_quantity * product.detailCart_unitPrice
        );
      }, 0);
      if (totalOrder < discount_min_order_value)
        throw new BadRequestError("You are not eligible (minimum value)!");
    }

    let amount = 0;
    if (discount_type === "fixed_amount") amount = discount_value;
    else if (discount_type === "percentage") {
      let temp = totalOrder * (discount_value / 100);
      amount = temp < discount_max_value ? temp : discount_max_value;
    }

    // Update lại discountCode khi được sử dụng
    const results = await discountModel.findByIdAndUpdate(
      foundDiscount._id,
      {
        $push: {
          discount_users_count: userId,
        },
        $inc: {
          discount_uses_count: 1,
        },
      },
      { new: true }
    );

    return {
      totalOrder: totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
      discount_code: results,
    };
  }

  // Get discount code amount === apply code (Dạng review)
  static async getDiscountAmountReview({
    discount_code,
    userId,
    shopId,
    products,
  }) {
    const foundDiscount = await findDiscountCodeByCodeAndShopId({
      discount_code: discount_code,
      shopId: shopId,
    });
    if (!foundDiscount) throw new NotFoundError("Discount is not existed!");
    // get list detail cart
    // products: [detailCartId] {list}
    let productList = [];
    for (let i = 0; i < products.length; i++) {
      const foundProduct = await findProductItemByDetailCartId({
        detailCartId: products[i],
      });
      if (!foundProduct) {
        throw new NotFoundError("Product is not existed in Shop!");
      }
      if (foundProduct.detailCart_ShopId.toString() !== shopId.toString()) {
        throw new BadRequestError("Product is not belong to Shop!");
      }
      productList.push(foundProduct);
    }

    const {
      discount_is_active,
      discount_end_date,
      discount_start_date,
      discount_min_order_value,
      discount_max_uses,
      discount_uses_count,
      discount_max_uses_per_user,
      discount_users_count,
      discount_value,
      discount_max_value,
      discount_type,
      discount_product_ids,
      discount_applies_to,
    } = foundDiscount;

    // check active
    if (!discount_is_active)
      throw new BadRequestError("Discount is not active!");

    // check date
    if (new Date() < new Date(discount_start_date))
      throw new BadRequestError("Discount code is not started!");
    if (new Date() > new Date(discount_end_date))
      throw new BadRequestError("Discount code is expired!");

    // check discount code can uses
    if (discount_max_uses > 0) {
      if (discount_max_uses <= discount_uses_count)
        throw new BadRequestError("Discount code has expired (max uses)!");
      let user_use_count = discount_users_count.reduce((total, user) => {
        return total + (user === userId ? 1 : 0);
      }, 0);
      if (user_use_count === discount_max_uses_per_user)
        throw new BadRequestError("User has used all the discount code turns!");
    }

    // check can use discount for product
    if (discount_applies_to === "specific") {
      for (let i = 0; i < productList.length; i++) {
        if (!discount_product_ids.includes(productList[i].detailCart_productId))
          throw new NotFoundError(
            `This product can not use this discount! (id: ${productList[i].detailCart_productId})`
          );
      }
    }

    // check min order
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      totalOrder = productList.reduce((total, product) => {
        return (
          total + product.detailCart_quantity * product.detailCart_unitPrice
        );
      }, 0);
      if (totalOrder < discount_min_order_value)
        throw new BadRequestError("You are not eligible (minimum value)!");
    }

    let amount = 0;
    if (discount_type === "fixed_amount") amount = discount_value;
    else if (discount_type === "percentage") {
      let temp = totalOrder * (discount_value / 100);
      amount = temp < discount_max_value ? temp : discount_max_value;
    }

    return {
      totalOrder: totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async deleteDiscountCode({ discount_code, discount_shopId }) {
    let foundDiscount = await findDiscountCodeByCodeAndShopId({
      discount_code: discount_code,
      shopId: discount_shopId,
    });

    if (!foundDiscount) throw new NotFoundError("Discount is not existed!");
    const results = await softDeleteDiscountCode({ id: foundDiscount._id });
    return results;
  }

  static async cancelDiscountCode({ discount_code, discount_shopId, userId }) {
    let foundDiscount = await findDiscountCodeByCodeAndShopId({
      discount_code: discount_code,
      shopId: discount_shopId,
    });
    if (!foundDiscount) throw new NotFoundError("Discount is not existed!");

    const results = await discountModel.findByIdAndUpdate(
      foundDiscount._id,
      {
        $pull: {
          discount_users_count: userId,
        },
        $inc: {
          discount_uses_count: -1,
        },
      },
      { new: true }
    );
    return results;
  }
}

module.exports = discountService;
