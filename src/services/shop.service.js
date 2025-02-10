"use strict";

const shopModel = require("../models/shop.model");

class shopService {
  static findByEmail = async ({ email }) => {
    let results = await shopModel.findOne({ email }).lean();
    return results;
  };
}

module.exports = {
  shopService,
};
