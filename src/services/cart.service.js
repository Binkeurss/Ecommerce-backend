"use strict";

const { findProductById } = require("../models/repositories/product.repo");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { cartModel } = require("../models/cart.model");
const {
  createUserCart,
  findCartByUserId,
  updateUserCartQuantity,
  removeAllProductInCart,
} = require("../models/repositories/cart.repo");

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
  static async addToCart({ userId, product = {} }) {
    // check cart tồn tại
    const userCart = await findCartByUserId({ userId: userId });
    if (!userCart) {
      const results = await createUserCart({
        userId: userId,
        product: product,
      });
      return results;
    }
    // Nếu có giỏ hàng rồi nhưng chưa có sản phẩm
    if (!userCart.cart_products.length) {
      userCart.cart_products.push(product);
      userCart.cart_count_product += product.quantity;
      return await userCart.save();
    }

    // Nếu có giỏ hàng và tồn tài sản phẩm được thêm vào
    const results = await updateUserCartQuantity({
      userId: userId,
      product: product,
    });
    return results;
  }

  /**
   * shop_order_ids: [{
   *  shopId,
   *  item_products: [
   *    {
   *      quantity,
   *      price,
   *      shopId,
   *      old_quantity,
   *      productId
   *    }
   *  ],
   *  version
   * }]
   */

  static async ReduceIncreaseProductToCart({ userId, shop_order_ids }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];
    const foundProduct = await findProductById({ product_id: productId });
    if (!foundProduct) {
      throw new NotFoundError(`Not found the product has id: ${productId}`);
    }
    // compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) {
      throw new BadRequestError("This product is not belong to the shop");
    }
    if (quantity === 0) {
      const results = await this.deleteUserCart({
        userId: userId,
        productId: productId,
      });
      return results;
    }
    const results = await updateUserCartQuantity({
      userId: userId,
      product: {
        productId: productId,
        quantity: quantity - old_quantity,
      },
    });
    return results;
  }

  static async deleteUserCartItem({ userId, productId }) {
    const detailUserCart = await findCartByUserId({ userId: userId });
    let quantityProduct = 0;
    for (let i = 0; i < detailUserCart.cart_products.length; i++) {
      if (detailUserCart.cart_products[i].productId === productId) {
        quantityProduct = detailUserCart.cart_products[i].quantity;
        break;
      }
    }
    console.log("quantityProduct: ", quantityProduct);
    const query = { cart_userId: userId, cart_state: "active" };
    const updateSet = {
      $pull: {
        cart_products: {
          productId: productId,
        },
      },
      $inc: {
        cart_count_product: -1 * quantityProduct,
      },
    };
    const results = await cartModel.updateOne(query, updateSet, { new: true });
    return results;
  }

  static async getListUserCart({ userId }) {
    let results = await cartModel.findOne({ cart_userId: +userId }).lean();
    return results;
  }

  static async deleteUserCart({ userId }) {
    const foundCart = await findCartByUserId({ userId: userId });
    if (!foundCart) {
      throw new NotFoundError("Cart không tồn tại!");
    }
    const results = await removeAllProductInCart({
      userId: userId,
      listProduct: foundCart,
    });
    return results;
  }
}

module.exports = CartService;
