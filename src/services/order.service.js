"use strict";
const {
  getOrdersByUserId,
  getOrderByOrderId,
  patchUpdateStatusOrderByUser,
} = require("../models/repositories/order.repo");
const { BadRequestError } = require("../core/error.response");

const order_status_enum = [
  "pending",
  "confirmed",
  "shipping",
  "cancelled",
  "delivered",
];

class OrderService {
  static async getOrdersByUser({ userId, limit, skip }) {
    const foundOrder = await getOrdersByUserId({
      order_userId: userId,
      limit: limit,
      skip: skip,
    });
    if (!foundOrder) {
      throw new BadRequestError("Can not get orders by userId!");
    }
    return foundOrder;
  }

  static async getOneOrderById({ orderId }) {
    const foundOrder = await getOrderByOrderId({ orderId: orderId });
    if (!foundOrder) {
      throw new BadRequestError("Can not get user's order by orderId!");
    }
    return foundOrder;
  }

  static async patchCancelOrderByUser({ userId, orderId }) {
    const foundOrder = await getOrderByOrderId({ orderId: orderId });
    if (!foundOrder) {
      throw new BadRequestError(`Order is not existed! (orderId: ${orderId})`);
    }
    const listOrders = await getOrdersByUserId({ order_userId: userId });
    let checkExisted = false;
    listOrders.forEach((order) => {
      if (order._id.toString() === foundOrder._id.toString()) {
        checkExisted = true;
      }
    });
    if (!checkExisted) {
      throw new BadRequestError(`This order is not belong to user!`);
    }
    const updateOrder = await patchUpdateStatusOrderByUser({
      userId: userId,
      orderId: orderId,
      status: "cancelled",
    });
    return updateOrder;
  }

  static async patchUpdateOrderStatusByShop({ userId, orderId, status }) {
    if (!order_status_enum.includes(status)) {
      throw new BadRequestError(`Status is not existed! (status: ${status})`);
    }
    const foundOrder = await getOrderByOrderId({ orderId: orderId });
    if (!foundOrder) {
      throw new BadRequestError(`Order is not existed! (orderId: ${orderId})`);
    }
    const listOrders = await getOrdersByUserId({ order_userId: userId });
    let checkExisted = false;
    listOrders.forEach((order) => {
      if (order._id.toString() === foundOrder._id.toString()) {
        checkExisted = true;
      }
    });
    if (!checkExisted) {
      throw new BadRequestError(`This order is not belong to user!`);
    }
    const updateOrder = await patchUpdateStatusOrderByUser({
      userId: userId,
      orderId: orderId,
      status: status,
    });
    return updateOrder;
  }
}

module.exports = OrderService;
