"use strict";
const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user.controller");
const asyncHandler = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");

// authentication
router.use(authenticationV2);

router.get("/user-email", asyncHandler(userController.getShopByEmail));

module.exports = router;
