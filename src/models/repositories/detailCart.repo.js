"use strict";
const { detailCartModel } = require("../detailCart.model");

const addProductToDetailCart = async ({
  cartId,
  productId,
  quantity,
  unitPrice,
  shopId,
}) => {
  const results = await detailCartModel.create({
    detailCart_CartId: cartId,
    detailCart_productId: productId,
    detailCart_quantity: quantity,
    detailCart_unitPrice: unitPrice,
    detailCart_ShopId: shopId,
  });
  return results;
};

const updateQuantityProductDetailCart = async ({
  cartId,
  productId,
  quantity,
  productPrice,
  shopId,
}) => {
  const filter = {
    detailCart_CartId: cartId,
    detailCart_productId: productId,
    detailCart_ShopId: shopId,
  };
  const update = {
    $inc: {
      detailCart_quantity: quantity,
    },
    $set: {
      detailCart_unitPrice: productPrice,
    },
  };
  const options = {
    upsert: true,
    new: true,
  };
  const results = await detailCartModel.findOneAndUpdate(
    filter,
    update,
    options
  );
  return results;
};

const getListProductsInDetailCartByCartId = async ({ cartId }) => {
  const filter = { detailCart_CartId: cartId };
  const results = await detailCartModel.find(filter);
  return results;
};

const findProductItem = async ({ cartId, productId }) => {
  const filter = {
    detailCart_CartId: cartId,
    detailCart_productId: productId,
  };
  const results = await detailCartModel.findOne(filter);
  return results;
};

const deleteProductItem = async ({ cartId, productId }) => {
  const filter = {
    detailCart_CartId: cartId,
    detailCart_productId: productId,
  };
  const results = await detailCartModel.findOneAndDelete(filter);
  return results;
};

const deleteAllProductItem = async ({ cartId }) => {
  const filter = {
    detailCart_CartId: cartId,
  };
  const results = await detailCartModel.deleteMany(filter);
  return results;
};

module.exports = {
  addProductToDetailCart,
  updateQuantityProductDetailCart,
  getListProductsInDetailCartByCartId,
  findProductItem,
  deleteProductItem,
  deleteAllProductItem,
};
