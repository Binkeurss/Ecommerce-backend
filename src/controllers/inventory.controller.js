"use strict";

const InventoryService = require("../services/inventory.service");

class InventoryController {
  async addStockToInventory(req, res, next) {
    const { stock, productId, shopId, location } = req.body;
    try {
      const results = await InventoryService.addStockToInventory({
        stock: stock,
        productId: productId,
        shopId: shopId,
        location: location,
      });
      return res.status(201).json({
        code: "201",
        message: "Update product in Inventory successfully!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();
