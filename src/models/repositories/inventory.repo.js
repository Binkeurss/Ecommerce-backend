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

// Đặt hàng thì phải trừ tồn kho
const reservationInventory = async ({ productId, quantity, cartId }) => {
  const query = {
    inventory_productId: productId,
    inventory_stock: { $gte: quantity },
  };
  const updateSet = {
    $inc: {
      inventory_stock: -1 * quantity,
    },
    $push: {
      inventory_reservations: {
        quantity,
        cartId,
        createAt: new Date(),
      },
    },
  };
  const options = { upsert: true, new: true };
  const results = await inventoryModel.updateOne(query, updateSet, options);
  return results;
};

module.exports = {
  insertInventory,
  reservationInventory,
};
