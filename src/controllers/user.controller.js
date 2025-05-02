"use strict";

const { userService } = require("../services/shop.service");

class userController {
  getShopByEmail = async (req, res, next) => {
    const { email } = req.body;
    try {
      const results = await userService.findByEmail({ email });
      return res.status(200).json({
        code: "200",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new userController();
