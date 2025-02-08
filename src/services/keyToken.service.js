"use strict";

const { mongoose } = require("mongoose");
const keyTokenModel = require("../models/keyToken.model");
const { NotFoundError } = require("../core/error.response");

class keyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
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

  static findByUserId = async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new NotFoundError("userId is invalid!");
    }
    const results = await keyTokenModel.findOne({ user: userId }).lean();
    return results;
  };

  static removeKeyById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundError("id is invalid!");
    }
    const results = await keyTokenModel.deleteOne({
      _id: id,
    });
    return results;
  };

  static findByRefreshTokenUsed = async (refreshToken) => {
    const results = await keyTokenModel
      .findOne({
        refreshTokensUsed: refreshToken,
      })
      .lean();
    return results;
  };

  static findByRefreshToken = async (refreshToken) => {
    const results = await keyTokenModel
      .findOne({ refreshToken: refreshToken })
      .lean();
    console.log("results: ", results);
    return results;
  };

  static deleteKeyById = async (userId) => {
    const results = await keyTokenModel.deleteOne({ user: userId });
    return results;
  };

  static updateRefreshTokenById = async (
    userId,
    oldRefreshToken,
    newRefreshToken
  ) => {
    const results = await keyTokenModel.findOneAndUpdate(
      { user: userId },
      {
        $set: { refreshToken: newRefreshToken },
        $addToSet: { refreshTokensUsed: oldRefreshToken },
      }
    );
    return results;
  };
}

module.exports = keyTokenService;
