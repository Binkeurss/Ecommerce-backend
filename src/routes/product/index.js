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
// get all products
router.get("/products", asyncHandler(ProductController.getAllProducts));
//get product by id
router.get("/product/:id", asyncHandler(ProductController.getProductById));

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
  "/product/drafts/all/:id",
  asyncHandler(ProductController.getAllDraftsForShop)
);
router.get(
  "/product/published/all/:id",
  asyncHandler(ProductController.getAllPublishedForShop)
);
router.put(
  "/product/publish/:id",
  asyncHandler(ProductController.putPublishProductById)
);
router.put(
  "/product/unpublish/:id",
  asyncHandler(ProductController.putUnPublishProductById)
);

router.patch(
  "/product/:id",
  asyncHandler(ProductController.patchUpdateProductById)
);
module.exports = router;
