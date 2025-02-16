"use strict";

const express = require("express");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const DiscountController = require("../../controllers/discount.controller");

// authentication
router.use(authenticationV2);

// create new discount code
router.post("/discount", asyncHandler(DiscountController.createDiscount));
// update discount code
router.patch(
  "/discount/:id",
  asyncHandler(DiscountController.patchUpdateDiscount)
);
// get all discount codes of shop
router.get(
  "/discount/:shopId",
  asyncHandler(DiscountController.getAllDiscountsShop)
);
// get all products can use discount code
router.get(
  "/discount-products/products",
  asyncHandler(DiscountController.getAllProductsDiscountCode)
);
// get discount amount - apply discount
router.post(
  "/discount-amount",
  asyncHandler(DiscountController.postDiscountAmount)
);
// soft delete
router.delete("/discount", asyncHandler(DiscountController.deleteDiscountCode));
// Cancel discount code
router.post(
  "/discount-cancel",
  asyncHandler(DiscountController.postCancelDiscountCode)
);

module.exports = router;
