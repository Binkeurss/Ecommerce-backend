"use strict";

const express = require("express");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");
const OrderController = require("../../controllers/order.controller");

router.get("/order/:userId", asyncHandler(OrderController.getOrdersByUserId));
router.get("/order", asyncHandler(OrderController.getOrderByOrderId));
router.patch(
  "/order-cancel",
  asyncHandler(OrderController.patchCancelOrderByUser)
);
router.patch(
  "/order-status",
  asyncHandler(OrderController.patchUpdateOrderStatusByShop)
);

module.exports = router;
