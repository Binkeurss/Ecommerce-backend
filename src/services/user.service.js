"use strict";

const userModel = require("../models/user.model");

class userService {
  static findByEmail = async ({ email }) => {
    let results = await userModel
      .findOne({ email })
      .select("_id name email status verify roles")
      .lean();
    return results;
  };
}

module.exports = {
  userService,
};
