"use strict";
const mongoose = require("mongoose");
const {
  productModel,
  clothingModel,
  electronicsModel,
  furnitureModel,
} = require("../product.model");
const { getSelectData, getUnSelectData } = require("../../utils");

const queryProduct = async ({ query, limit, skip }) => {
  const results = await productModel
    .find(query)
    .populate("product_shop")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
  return results;
};

const findAllDraftsForShop = async ({ query, limit, skip }) => {
  const results = await queryProduct({ query, limit, skip });
  return results;
};

const findAllPublishedForShop = async ({ query, limit, skip }) => {
  const results = await queryProduct({ query, limit, skip });
  return results;
};

const searchProductByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await productModel
    .find(
      {
        isPublished: true,
        $text: { $search: regexSearch },
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();
  return results;
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await productModel.findOne({
    product_shop: product_shop,
    _id: product_id,
  });
  if (!foundShop) return null;
  foundShop.isDraft = false;
  foundShop.isPublished = true;
  const results = await foundShop.save();
  return results;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await productModel.findOne({
    product_shop: product_shop,
    _id: product_id,
  });
  if (!foundShop) return null;
  foundShop.isDraft = true;
  foundShop.isPublished = false;
  const results = await foundShop.save();
  return results;
};

const findAllProducts = async ({ limit, sort, skip, filter, select }) => {
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const products = productModel
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
  return products;
};

const findProductById = async ({ product_id, unSelect }) => {
  const foundProduct = await productModel
    .findOne({ _id: product_id })
    .select(getUnSelectData(unSelect))
    .lean();
  return foundProduct;
};

const updateProductById = async ({
  product_id,
  payload,
  model,
  isNew = true,
}) => {
  const results = await model.findByIdAndUpdate(
    { _id: product_id },
    payload,
    { new: isNew }
  );
  return results;
};

module.exports = {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishedForShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProductById,
  updateProductById
};
