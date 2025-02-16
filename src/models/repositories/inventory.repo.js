"use strict";
const { inventoryModel } = require("../../models/inventory.model");

const insertInventory = async ({
  productId,
  shopId,
  stock,
  location = "Unknown",
}) => {
  const results = await inventoryModel.create({
    inventory_productId: productId,
    inventory_shopId: shopId,
    inventory_stock: stock,
    inventory_location: location,
  });
  return results;
};

module.exports = {
  insertInventory,
};
