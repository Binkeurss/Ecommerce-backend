"use strict";

const mongoose = require("mongoose");
const { findProductById } = require("../models/repositories/product.repo");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const {
  createUserCart,
  findCartByUserId,
  updateUserCartQuantity,
  getListProductsInCart,
} = require("../models/repositories/cart.repo");
const {
  findProductItem,
  deleteProductItem,
  updateQuantityProductDetailCart,
  deleteAllProductItem,
} = require("../models/repositories/detailCart.repo");
const { findUserByUserId } = require("../models/repositories/user.repo");

/**
 * Key features: Cart service
 * - Add product to Cart [USER]
 * - Reduce product quantity [USER]
 * - Increase product quantity [USER]
 * - Get list to Cart [USER]
 * - Delete Cart [USER]
 * - Delete cart item [USER]
 */

class CartService {
  // Khi bấm thêm vào giỏ hàng => 2TH:
  // 1. Tạo mới giỏ hàng và thêm sản phẩm
  // 2. Đã có giỏ hàng => tìm sản phẩm => tăng quantity (nếu có sp)
  static async addToCart({ userId, products = [] }) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("Invalid userId!");
    }
    const userCart = await findCartByUserId({ userId: userId });
    if (!userCart) {
      const results = await createUserCart({
        userId: userId,
        products: products,
      });
      return results;
    }

    // Nếu có giỏ hàng
    const results = await updateUserCartQuantity({
      cartId: userCart._id,
      products: products,
    });
    return results;
  }

  static async updateProductQuantityToCart({ userId, productId, newQuantity }) {
    const foundProduct = await findProductById({ product_id: productId });
    if (!foundProduct) {
      throw new NotFoundError(`Not found the product has id: ${productId}`);
    }

    const foundUser = await findUserByUserId({ userId: userId });
    if (!foundUser) {
      throw new NotFoundError(`Not found the user has id: ${userId}`);
    }

    const foundCart = await findCartByUserId({ userId: userId });
    if (!foundCart) {
      throw new NotFoundError(`Cart is not existed!`);
    }

    const foundProductItem = await findProductItem({
      cartId: foundCart._id,
      productId: productId,
    });
    if (!foundProductItem) {
      throw new NotFoundError(`Product is not in Cart!`);
    }

    const results = await updateQuantityProductDetailCart({
      cartId: foundCart._id,
      productId: productId,
      quantity: newQuantity - foundProductItem.detailCart_quantity,
      shopId: foundProduct.product_shop,
    });

    return results;
  }

  static async deleteUserCartItem({ userId, productId }) {
    const foundCart = await findCartByUserId({ userId: userId });
    if (!foundCart) {
      throw new NotFoundError("Cart is not existed!");
    }
    const foundProductItem = await findProductItem({
      cartId: foundCart._id,
      productId: productId,
    });
    if (!foundProductItem) {
      throw new NotFoundError("Product Item is not existed!");
    }
    const results = await deleteProductItem({
      cartId: foundCart._id,
      productId: productId,
    });
    return results;
  }

  static async getListUserCart({ userId }) {
    const foundCart = await findCartByUserId({ userId: userId });
    if (!foundCart) {
      throw new NotFoundError("Cart is not existed!");
    }
    const results = await getListProductsInCart({ cartId: foundCart._id });
    return {
      userId: foundCart.cart_userId,
      products: results,
    };
  }

  static async deleteUserCart({ userId }) {
    const foundCart = await findCartByUserId({ userId: userId });
    if (!foundCart) {
      throw new NotFoundError("Cart is not existed!");
    }
    const results = await deleteAllProductItem({
      cartId: foundCart._id,
    });
    return results;
  }
}

module.exports = CartService;
