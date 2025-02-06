"use strict";

const shopModel = require("../models/shop.model");

class shopService {
  static findByEmail = async ({ email }) => {
    let result = await shopModel.findOne({ email }).lean();
    return result;
  };
}

module.exports = {
  shopService,
};
