"use strict";

const { inventoryModel } = require("../models/inventory.model");
const { findProductById } = require("../models/repositories/product.repo");
const { BadRequestError } = require("../core/error.response");
const { productModel } = require("../models/product.model");

class InventoryService {
  static async addStockToInventory({
    stock,
    productId,
    shopId,
    location = "Thu Duc city, HCM",
  }) {
    const foundProduct = await findProductById({ product_id: productId });
    if (!foundProduct) throw new BadRequestError("Product is not existed! ");
    const query = {
      inventory_productId: productId,
      inventory_shopId: shopId,
    };
    const updateInventory = {
      $inc: {
        inventory_stock: stock,
      },
      $set: {
        inventory_location: location,
      },
    };
    const options = {
      upsert: true,
      new: true,
    };
    // Update tại product và inventory
    const updateQuantityProduct = await productModel.findOneAndUpdate(
      { _id: productId },
      {
        $inc: {
          product_quantity: stock,
        },
      },
      { new: true }
    );
    const results = await inventoryModel.findOneAndUpdate(
      query,
      updateInventory,
      options
    );
    return {
      Product: updateQuantityProduct,
      Inventory: results,
    };
  }
}

module.exports = InventoryService;
