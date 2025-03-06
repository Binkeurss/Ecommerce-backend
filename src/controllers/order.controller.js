"use strict";

const OrderService = require("../services/order.service");

class OrderController {
  async getOrdersByUserId(req, res, next) {
    const { userId } = req.params;
    const { limit, page } = req.query;
    console.log("userId: ", userId);
    console.log("limit: ", limit);
    console.log("page: ", page);
    const skip = (page - 1) * limit;
    try {
      const results = await OrderService.getOrdersByUser({
        userId: userId,
        limit: limit,
        skip: skip,
      });
      return res.status(200).json({
        code: "200",
        message: "Get Orders By UserId Successfully!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderByOrderId(req, res, next) {
    const { orderId } = req.body;
    try {
      const results = await OrderService.getOneOrderById({ orderId: orderId });
      return res.status(200).json({
        code: "200",
        message: "Get Order By orderId Successfully!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async patchCancelOrderByUser(req, res, next) {
    const { userId, orderId } = req.body;
    try {
      const results = await OrderService.patchCancelOrderByUser({
        userId: userId,
        orderId: orderId,
      });
      return res.status(201).json({
        code: "201",
        message: "Cancelled Order Successfully!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async patchUpdateOrderStatusByShop(req, res, next) {
    const { userId, orderId, status } = req.body;
    try {
      const results = await OrderService.patchUpdateOrderStatusByShop({
        userId: userId,
        orderId: orderId,
        status: status,
      });
      return res.status(201).json({
        code: "201",
        message: `Update Status Order Successfully! (Status: ${status})`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
