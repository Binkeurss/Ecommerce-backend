"use strict";

const express = require("express");
const router = express.Router();
const accessRouter = require("./access");
const productRouter = require("./product");
const userRouter = require("./user");
const discountRouter = require("./discount");
const cartRouter = require("./cart");
const checkoutRouter = require("./checkout");
const inventoryRouter = require("./inventory");
const orderRouter = require("./order");
const commentRouter = require("./comment");
const { apiKey, permission } = require("../auth/checkAuth");
const asyncHandler = require("../helpers/asyncHandler");
const accessController = require("../controllers/access.controller");

const { pushToLogDiscord } = require("../middlewares");
//add log to discord
router.use(pushToLogDiscord);

// check apiKey
router.use(apiKey);
// check permission
router.use(permission("0000"));

// signUp
router.post("/v1/api/user/signup", asyncHandler(accessController.signUp));
// signIn
router.post("/v1/api/user/signin", asyncHandler(accessController.signIn));

router.use("/v1/api", accessRouter);
router.use("/v1/api", productRouter);
router.use("/v1/api", userRouter);
router.use("/v1/api", discountRouter);
router.use("/v1/api", cartRouter);
router.use("/v1/api", checkoutRouter);
router.use("/v1/api", inventoryRouter);
router.use("/v1/api", orderRouter);
router.use("/v1/api", commentRouter);

module.exports = router;
