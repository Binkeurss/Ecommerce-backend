"use strict";

const keyTokenModel = require("../keyToken.model");

const findKeyTokenByUserId = async ({ userId }) => {
  const results = await keyTokenModel
    .findOne({ user: userId })
    .select({ _id: 1, user: 1, privateKey: 1, publicKey: 1 });
  return results;
};

module.exports = {
  findKeyTokenByUserId,
};
