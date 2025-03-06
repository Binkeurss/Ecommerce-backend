"use strict";

const CheckoutService = require("../services/checkout.service");

class CheckoutController {
  checkoutReview = async (req, res, next) => {
    const { cartId, userId, shop_order_ids } = req.body;
    try {
      const results = await CheckoutService.checkoutReview({
        cartId: cartId,
        userId: userId,
        shop_order_ids: shop_order_ids,
      });
      return res.status(200).json({
        code: "200",
        message: "Checkout review successfully!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };
  postOrderByUser = async (req, res, next) => {
    const {
      shop_order_ids,
      cartId,
      userId,
      user_address = {},
      user_payment = {},
    } = req.body;
    try {
      const results = await CheckoutService.orderByUser({
        shop_order_ids: shop_order_ids,
        cartId: cartId,
        userId: userId,
        user_address: user_address,
        user_payment: user_payment,
      });
      return res.status(201).json({
        code: "201",
        message: "Order by user successfully!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new CheckoutController();
