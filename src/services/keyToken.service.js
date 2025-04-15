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
          refreshToken: results.refreshToken,
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

  static removeKeyByIdSignOut = async (keyStore) => {
    // Cần xem lại logic
    if (!mongoose.Types.ObjectId.isValid(keyStore._id)) {
      throw new NotFoundError("Id is invalid!");
    }
    
    const filter = {
      user: keyStore.user,
    };
    // console.log("refreshToken: ", foundKeyStore.refreshToken);
    const update = {
      $addToSet: { refreshTokensUsed: keyStore.refreshToken },
      $set: { refreshToken: null },
    };
    const options = {
      new: true,
    };
    const results = await keyTokenModel.findOneAndUpdate(
      filter,
      update,
      options
    );
    return results;
  };

  static removeRefreshTokenByUserId = async (userId) => {};

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
