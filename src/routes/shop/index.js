"use strict";
const express = require("express");
const router = express.Router();
const ShopController = require("../../controllers/shop.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");

// authentication
router.use(authenticationV2);

router.get("/shop-email", asyncHandler(ShopController.getShopByEmail));

module.exports = router;
