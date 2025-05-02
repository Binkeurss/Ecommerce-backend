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

  getAllDraftsForShop = async (req, res, next) => {
    const { id } = req.params;
    const { limit, page } = req.query;
    const offset = (page - 1) * limit;
    try {
      const results = await ProductFactoryStrategy.findAllDraftsForShop({
        product_shop: id,
        limit,
        offset,
      });
      return res.status(200).json({
        code: "200",
        message: "Get all drafts for shop!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllPublishedForShop = async (req, res, next) => {
    const { id } = req.params;
    const { limit, page } = req.query;
    const offset = (page - 1) * limit;
    try {
      const results = await ProductFactoryStrategy.findAllPublishedForShop({
        product_shop: id,
        limit,
        offset,
      });
      return res.status(200).json({
        code: "200",
        message: "Get all published for shop!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

  putPublishProductById = async (req, res, next) => {
    const { id } = req.params;
    const product_shop = req.keyStore.user;
    try {
      const results = await ProductFactoryStrategy.publishProductByShop({
        product_shop,
        product_id: id,
      });
      return res.status(200).json({
        code: "200",
        message: `Publish product has id: ${id}`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

  putUnPublishProductById = async (req, res, next) => {
    const { id } = req.params;
    const product_shop = req.keyStore.user;
    try {
      const results = await ProductFactoryStrategy.unPublishProductByShop({
        product_shop,
        product_id: id,
      });
      return res.status(200).json({
        code: "200",
        message: `Unpublish product has id: ${id}`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

  getListSearchProduct = async (req, res, next) => {
    const { keySearch } = req.params;
    try {
      const results = await ProductFactoryStrategy.searchProducts({
        keySearch,
      });
      return res.status(200).json({
        code: "200",
        message: `Search: ${keySearch}`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllProducts = async (req, res, next) => {
    const { limit, page, sort, filter } = req.query;
    try {
      const results = await ProductFactoryStrategy.findAllProducts({
        limit,
        page,
        sort,
        filter,
      });
      return res.status(200).json({
        code: "200",
        message: `Get all products`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req, res, next) => {
    const { id: product_id } = req.params;
    try {
      const results = await ProductFactoryStrategy.findProductById({
        product_id,
      });
      return res.status(200).json({
        code: "200",
        message: `Get product has id: ${product_id}`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

  patchUpdateProductById = async (req, res, next) => {
    const { id: product_id } = req.params;
    const { product_type, payload } = req.body;
    try {
      const results = await ProductFactoryStrategy.updateProduct(
        product_type,
        product_id,
        payload
      );
      return res.status(201).json({
        code: "201",
        message: `Update product's data has id: ${product_id}`,
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ProductController();
