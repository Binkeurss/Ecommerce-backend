"use strict";

const CartService = require("../services/cart.service");

class CartController {
  async postAddToCart(req, res, next) {
    const { userId, product } = req.body;
    try {
      const results = await CartService.addToCart({
        userId: userId,
        product: product,
      });
      return res.status(201).json({
        code: "201",
        message: "Add product to cart succesfully!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async postReduceProductQuantity(req, res, next) {
    const { userId, shop_order_ids } = req.body;
    try {
      const results = await CartService.ReduceIncreaseProductToCart({
        userId: userId,
        shop_order_ids: shop_order_ids,
      });
      return res.status(201).json({
        code: "201",
        message: "Reduce product quantity successfully!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async postIncreaseProductQuantity(req, res, next) {
    const { userId, shop_order_ids } = req.body;
    try {
      const results = await CartService.ReduceIncreaseProductToCart({
        userId: userId,
        shop_order_ids: shop_order_ids,
      });
      return res.status(201).json({
        code: "201",
        message: "Increase product quantity successfully!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async getListUserCart(req, res, next) {
    const { userId } = req.params;
    try {
      const results = await CartService.getListUserCart({ userId: userId });
      return res.status(200).json({
        code: "200",
        message: "Get list user cart successfully!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCartItem(req, res, next) {
    const { userId, productId } = req.body;
    try {
      const results = await CartService.deleteUserCartItem({
        userId: userId,
        productId: productId,
      });
      return res.status(201).json({
        code: "201",
        message: `Delete items in cart succesfully! (${productId})`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserCart(req, res, next) {
    const { userId } = req.params;
    try {
      const results = await CartService.deleteUserCart({ userId: userId });
      return res.status(201).json({
        code: "201",
        message: `Delete all items in cart of user's id: ${userId}`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
