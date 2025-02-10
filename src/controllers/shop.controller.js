"use strict";

const { shopService } = require("../services/shop.service");

class ShopController {
  getShopByEmail = async (req, res, next) => {
    const { email } = req.body;
    try {
      const results = await shopService.findByEmail({ email });
      return res.status(200).json({
        code: "200",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ShopController();
