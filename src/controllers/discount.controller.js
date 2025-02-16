"use strict";

const discountService = require("../services/discount.service");

class DiscountController {
  createDiscount = async (req, res, next) => {
    const payload = req.body;
    try {
      const results = await discountService.createDiscountCode(payload);
      return res.status(201).json({
        code: "201",
        message: "Create new discount code successfully!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };
  patchUpdateDiscount = async (req, res, next) => {
    const { id: discount_id } = req.params;
    const { payload } = req.body;
    try {
      const results = await discountService.updateDiscountCode(
        discount_id,
        payload
      );
      return res.status(201).json({
        code: "201",
        message: `Update discount code has id: ${discount_id}`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };
  getAllDiscountsShop = async (req, res, next) => {
    const { shopId } = req.params;
    const { limit, page } = req.query;
    const offset = (page - 1) * limit;
    try {
      const results = await discountService.getAllDiscountsShop({
        limit: limit,
        skip: offset,
        sort: "ctime",
        shopId: shopId,
      });
      return res.status(200).json({
        code: "200",
        message: `Get all discount codes of shop has id: ${shopId}`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };
  getAllProductsDiscountCode = async (req, res, next) => {
    const { discount_code, shopId, userId } = req.body;
    const { limit, page } = req.query;
    const offset = (page - 1) * limit;
    try {
      const results = await discountService.getAllProdutsDiscount({
        discount_code: discount_code,
        shopId: shopId,
        userId: userId,
        limit: limit,
        skip: offset,
      });
      return res.status(200).json({
        code: "200",
        message: `Get all products can use discount_code: ${discount_code}`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

  postDiscountAmount = async (req, res, next) => {
    const { discount_code, userId, shopId, products } = req.body;
    try {
      const results = await discountService.getDiscountAmount({
        discount_code: discount_code,
        userId: userId,
        shopId: shopId,
        products: products,
      });
      return res.status(200).json({
        code: "200",
        message: `Get discount amount succesfully!`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteDiscountCode = async (req, res, next) => {
    const { discount_code, discount_shopId } = req.body;
    try {
      const results = await discountService.deleteDiscountCode({
        discount_code: discount_code,
        discount_shopId: discount_shopId,
      });
      return res.status(200).json({
        code: "200",
        message: `Delete discount code (${discount_code}) succesfully!`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

  postCancelDiscountCode = async (req, res, next) => {
    const { discount_code, discount_shopId, userId } = req.body;
    try {
      const results = await discountService.cancelDiscountCode({
        discount_code: discount_code,
        discount_shopId: discount_shopId,
        userId: userId,
      });
      return res.status(201).json({
        code: "201",
        message: `Cancel discount code (${discount_code}) succesfully!`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new DiscountController();
