"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const router = express.Router();
exports.router = router;
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");

// signUp
router.post("/shop/signup", asyncHandler(accessController.signUp));
// signIn
router.post("/shop/signin", asyncHandler(accessController.signIn));

// authentication
router.use(authentication);

// signOut
router.post("/shop/signout", asyncHandler(accessController.signOut));
module.exports = router;
