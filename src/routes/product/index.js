"use strict";

const express = require("express");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");
const ProductController = require("../../controllers/product.controller");
const { authenticationV2 } = require("../../auth/authUtils");

// search Product
router.get(
  "/product/search/:keySearch",
  asyncHandler(ProductController.getListSearchProduct)
);

// authentication
router.use(authenticationV2);

// createProduct
router.post("/product", asyncHandler(ProductController.createProduct));
router.post(
  "/product-fac-stra",
  asyncHandler(ProductController.createProductStrategy)
);

// QUERY
router.get(
  "/drafts/all/:id",
  asyncHandler(ProductController.getAllDraftsForShop)
);
router.get(
  "/published/all/:id",
  asyncHandler(ProductController.getAllPublishedForShop)
);
router.put(
  "/publish/:id",
  asyncHandler(ProductController.putPublishProductById)
);
router.put(
  "/unpublish/:id",
  asyncHandler(ProductController.putUnPublishProductById)
);


module.exports = router;
