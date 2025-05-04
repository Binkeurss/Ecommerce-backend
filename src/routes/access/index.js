"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const router = express.Router();
exports.router = router;
const asyncHandler = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");

// // signUp
// router.post("/v1/api/shop/signup", asyncHandler(accessController.signUp));
// // signIn
// router.post("/v1/api/shop/signin", asyncHandler(accessController.signIn));
// handlerRefreshToken
router.post(
  "/user/handlerRefreshToken",
  asyncHandler(accessController.handlerRefreshToken)
);

// authentication
router.use(authenticationV2);

// signOut
router.post("/user/signout", asyncHandler(accessController.signOut));

module.exports = router;
