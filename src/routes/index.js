"use strict";

const express = require("express");
const router = express.Router();
const accessRouter = require("./access");
const productRouter = require("./product");
const shopRouter = require("./shop");
const { apiKey, permission } = require("../auth/checkAuth");

// check apiKey
router.use(apiKey);
// check permission
router.use(permission("0000"));

router.use("/v1/api", accessRouter);
router.use("/v1/api", shopRouter);
router.use("/v1/api", productRouter);

module.exports = router;
