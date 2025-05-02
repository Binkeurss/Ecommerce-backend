"use strict";

const express = require("express");
const router = express.Router();
const { authenticationV2 } = require("../../auth/authUtils");
const CartController = require("../../controllers/cart.controller");
const asyncHandler = require("../../helpers/asyncHandler");

router.use(authenticationV2);

router.post("/cart/add", asyncHandler(CartController.postAddToCart));
router.post(
  "/cart/update-quantity",
  asyncHandler(CartController.postUpdateProductQuantity)
);
router.get("/cart/:userId", asyncHandler(CartController.getListUserCart));
router.delete("/cart-deleteItem", asyncHandler(CartController.deleteCartItem));
router.delete("/cart-deleteCart/:userId", asyncHandler(CartController.deleteUserCart));

module.exports = router;
