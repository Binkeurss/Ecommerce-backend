"use strict";
const mongoose = require("mongoose");
const {
  productModel,
  clothingModel,
  electronicsModel,
  furnitureModel,
} = require("../product.model");

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
    product_shop: new mongoose.Types.ObjectId(product_shop),
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

module.exports = {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishedForShop,
  unPublishProductByShop,
  searchProductByUser
};
