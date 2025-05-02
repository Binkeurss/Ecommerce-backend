"use strict";

const userModel = require("../user.model");

const findUserByUserId = async ({ userId }) => {
  const results = await userModel
    .findById(userId)
    .select("_id name email roles");
  return results;
};


module.exports = { findUserByUserId };
