"use strict";

const keyTokenModel = require("../models/keyToken.model");

class keyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      // level 0
      const publicKeyString = publicKey.toString();
      const privateKeyString = privateKey.toString();
      // const tokens = await keyTokenModel.create({
      //   user: userId,
      //   publicKey: publicKeyString,
      //   privateKey: privateKeyString,
      // });
      // level xxx
      const filter = { user: userId };
      const update = {
        publicKey: publicKeyString,
        privateKey: privateKeyString,
        refreshTokensUsed: [],
        refreshToken,
      };
      const options = { upsert: true, new: true }; // Nếu chưa có thì sẽ tạo mới, có rồi thì sẽ update
      const results = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      if (results) {
        let data = {
          publicKey: results.publicKey,
          privateKey: results.privateKey,
        };
        return data;
      } else {
        return null;
      }
    } catch (error) {
      return error;
    }
  };
}

module.exports = keyTokenService;
