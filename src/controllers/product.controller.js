"use strict";

const ProductService = require("../services/product.service");
const ProductFactoryStrategy = require("../services/product.service.strategy");

class ProductController {
  createProduct = async (req, res, next) => {
    const { type, payload } = req.body;
    try {
      const results = await ProductService.createProduct(type, {
        ...payload,
        // product_shop: req.user.userId,
      });
      return res.status(201).json({
        code: "201",
        message: "Create new product successfully!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };
  createProductStrategy = async (req, res, next) => {
    const { type, payload } = req.body;
    try {
      const results = await ProductFactoryStrategy.createProduct(type, payload);
      return res.status(201).json({
        code: "201",
        message: "Create new product successfully! (Factory-Strategy)",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ProductController();
