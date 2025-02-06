"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keyTokenService = require("./keyToken.service");
const { createTokensPair } = require("../auth/authUtils");
const { getInforData } = require("../utils");
const {
  BadRequestError,
  ConflictRequestEror,
} = require("../core/error.response");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

const SALTROUNDS = 10;

class accessService {
  static signUp = async ({ name, email, password }) => {
    // step 1: check email exists?
    const holderShop = await shopModel.findOne({ email: email }).lean(); // lean sẽ trả về 1 object JS thuần tuý, size < 30 lần
    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered!");
    }
    const passwordHash = await bcrypt.hash(password, SALTROUNDS);
    const newShop = await shopModel.create({
      name: name,
      email: email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });
    if (newShop) {
      // created privateKey, publicKey
      // Save to Collection Keys
      const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        // Public key CryptoGraphy Standards
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      });
      // Lưu xuống db: Keys (lưu xuống db và đồng thời trả về 1 string publicKey -> Cần đưa về format PEM để sử dụng cho việc tạo tokens)
      const publicKeyString = await keyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
      });
      if (!publicKeyString) {
        throw new BadRequestError("Error: publicKeyString error!");
        // return {
        //   code: "xxx",
        //   message: "publicKeyString error",
        // };
      }

      const publicKeyObject = crypto.createPublicKey(publicKeyString);

      // create tokens pair
      const tokens = await createTokensPair(
        { userId: newShop._id, email: email },
        publicKeyObject, // PEM
        privateKey
      );
      console.log(`Create tokens Success: `, tokens);
      return {
        code: 201,
        metadata: {
          shop: getInforData({
            fields: ["_id", "name", "email", "status", "roles"],
            object: newShop,
          }),
          tokens: tokens,
        },
      };
    } else {
      return {
        code: 200,
        metadata: null,
      };
    }
  };
}

module.exports = accessService;
