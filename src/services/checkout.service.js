"use strict";

const {
  findCartById,
  checkProductByServer,
} = require("../models/repositories/cart.repo");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountService = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");
const { createNewOrder } = require("../models/repositories/order.repo");
const {
  findDiscountCodeById,
} = require("../models/repositories/discount.repo");
const CartService = require("./cart.service");
const ProductFactoryStrategy = require("./product.service.strategy");
const {
  findProductById,
  updateProductById,
} = require("../models/repositories/product.repo");
const { productModel } = require("../models/product.model");

class CheckoutService {
  /**
   * {
   *  cartId,
   *  userId,
   *  shop_order_ids: [
   *    {
   *      shopId,
   *      shop_discounts: [],
   *      items_products: [
   *        price,
   *        quantity,
   *        productId
   *      ]
   *    },
   *    {
   *      shopId,
   *      shop_discounts: [
   *        {
   *          ShopId,
   *          discountId,
   *          discount_code,
   *        }
   *      ],
   *      items_products: [
   *        price,
   *        quantity,
   *        productId
   *      ]
   *    },
   *  ]
   * }
   */
  // Mục đích của hàm này là tạo ra object chứa 3 thông tin:
  // - shop_order_ids: Thông tin các sản phẩm ban đầu
  // - shop_order_ids_new: Thông tin tổng giá trị, giá trị sau khi áp dụng discount của từng cụm products
  // - checkout_order: Thông tin cuối cùng
  static async checkoutReview({ cartId, userId, shop_order_ids }) {
    // Check cartId tồn tại hay không
    const foundCart = await findCartById({ cartId: cartId });
    if (!foundCart) throw new BadRequestError("Cart is not existed!");

    // object chứa thông tin cuối cùng
    let checkout_order = {
      totalPrice: 0, // Tổng tiền hàng
      feeShip: 0, // Phí vận chuyển
      totalDiscount: 0, // Tổng tiền giảm giá
      totalCheckout: 0, // Tổng thanh toán
    };

    // Trả về list order mới, trong đó giá của các sản phẩm được nhân lên
    const shop_order_ids_new = [];
    // Tính tổng tiền bill
    for (let i = 0; i < shop_order_ids.length; i++) {
      const {
        shopId,
        shop_discounts = [],
        items_products = [],
      } = shop_order_ids[i];
      // check product available
      const checkProductServer = await checkProductByServer(items_products);
      checkProductServer.forEach((product) => {
        if (!product) {
          throw new BadRequestError("Order Wrong!");
        }
      });

      // Tổng số tiền chưa áp dụng discount của 1 sản phẩm
      const checkoutPrice = checkProductServer.reduce((total, product) => {
        return total + product.quantity * product.price;
      }, 0);

      // Tổng tiền trước khi xử lý
      checkout_order.totalPrice += checkoutPrice;

      let itemCheckout = {
        shopId: shopId,
        shop_discounts: shop_discounts,
        priceRaw: checkoutPrice, //  Tiền trước khi giảm giá
        priceApplyDiscount: checkoutPrice,
        items_products: checkProductServer,
      };

      // nếu shop_discounts có tồn tại, check xem có hợp lệ hay không
      if (shop_discounts.length > 0) {
        for (let j = 0; j < shop_discounts.length; j++) {
          const { totalPrice, discount } =
            await discountService.getDiscountAmountReview({
              discount_code: shop_discounts[j].discount_code,
              userId: userId,
              shopId: shop_discounts[j].shopId,
              products: checkProductServer,
            });
          checkout_order.totalDiscount += discount;
          itemCheckout.priceApplyDiscount -= discount;
        }
      }
      shop_order_ids_new.push(itemCheckout);
    }
    checkout_order.totalCheckout =
      checkout_order.totalPrice - checkout_order.totalDiscount;
    return {
      shop_order_ids, // ban đầu
      shop_order_ids_new, // sau khi check các sản phẩm và áp dụng discount
      checkout_order, // thông tin cuối cùng
    };
  }

  static async orderByUser({
    cartId,
    userId,
    shop_order_ids,
    user_address = {},
    user_payment = {},
  }) {
    const { shop_order_ids_new, checkout_order } =
      await CheckoutService.checkoutReview({
        cartId: cartId,
        userId: userId,
        shop_order_ids: shop_order_ids,
      });
    // Check lại xem có vượt tồn kho hay không
    // get new array Products
    const products = shop_order_ids_new.flatMap(
      (order) => order.items_products
    );

    console.log(`[1] products: `, products);
    const acquireProduct = [];
    // Sử dụng khoá bi quan (Pessimistic Locking)
    for (let i = 0; i < products.length; i++) {
      const { quantity, productId } = products[i];
      const keyLock = await acquireLock(productId, quantity, cartId);
      acquireProduct.push(keyLock ? true : false); // Nếu có giá trị false thì thông báo người dùng kiểm tra lại
      if (keyLock) {
        await releaseLock(keyLock.key, keyLock.uniqueValue);
      }
    }
    // Nếu có 1 sản phẩm hết hàng trong kho
    if (acquireProduct.includes(false)) {
      throw new BadRequestError(
        "Một số sản phẩm đã được cập nhật! Vui lòng kiểm tra lại tại Cart!"
      );
    }

    const newOrder = await createNewOrder({
      order_userId: userId,
      order_checkout: checkout_order,
      order_shipping: user_address,
      order_payment: user_payment,
      order_products: shop_order_ids_new,
    });
    // TH: insert thành công thì remove product ở trong cart và discount nếu có, inventory
    if (newOrder) {
      for (let j = 0; j < shop_order_ids_new.length; j++) {
        const {
          shopId,
          shop_discounts = [],
          items_products = [],
        } = shop_order_ids_new[j];
        console.log("shop_order_ids_new: ", shop_order_ids_new[j]);
        // update discount
        for (let k = 0; k < shop_discounts.length; k++) {
          await discountService.getDiscountAmount({
            discount_code: shop_discounts[k].discount_code,
            userId: userId,
            shopId: shop_discounts[k].shopId,
            products: items_products,
          });
        }
        for (let k = 0; k < items_products.length; k++) {
          // remove product from cart
          await CartService.deleteUserCartItem({
            userId: userId,
            productId: items_products[k].productId,
          });

          // update quantity product (collection)
          const payloadUpdateQuantity = {
            $inc: {
              product_quantity: -1 * items_products[k].quantity,
            },
          };
          await updateProductById({
            product_id: items_products[k].productId,
            payload: payloadUpdateQuantity,
            model: productModel,
          });
        }
        // update Inventory đã được làm tại acquireLock
      }
    }
    return newOrder;
  }

  static async getOrdersByUser() {}

  static async getOneOrderById() {}

  static async patchCancelOrderByUser() {}

  static async patchUpdateOrderStatusByShop() {}
}

module.exports = CheckoutService;
