"use strict";

const express = require("express");
const router = express.Router();
const accessRouter = require("./access");
const productRouter = require("./product");
const shopRouter = require("./shop");
const discountRouter = require("./discount");
const cartRouter = require("./cart");
const checkoutRouter = require("./checkout");
const inventoryRouter = require("./inventory");
const { apiKey, permission } = require("../auth/checkAuth");
const asyncHandler = require("../helpers/asyncHandler");
const accessController = require("../controllers/access.controller");

// check apiKey
router.use(apiKey);
// check permission
router.use(permission("0000"));

// signUp
router.post("/v1/api/shop/signup", asyncHandler(accessController.signUp));
// signIn
router.post("/v1/api/shop/signin", asyncHandler(accessController.signIn));

router.use("/v1/api", productRouter);
router.use("/v1/api", accessRouter);
router.use("/v1/api", shopRouter);
router.use("/v1/api", discountRouter);
router.use("/v1/api", cartRouter);
router.use("/v1/api", checkoutRouter);
router.use("/v1/api", inventoryRouter);

module.exports = router;
