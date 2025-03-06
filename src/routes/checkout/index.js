const express = require("express");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");
const CheckoutController = require("../../controllers/checkout.controller");

const { authenticationV2 } = require("../../auth/authUtils");

router.use(authenticationV2);
router.get("/checkout-review", asyncHandler(CheckoutController.checkoutReview));
router.post(
  "/checkout/orderByUser",
  asyncHandler(CheckoutController.postOrderByUser)
);

module.exports = router;
