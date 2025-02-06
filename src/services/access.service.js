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
  AuthFailureError,
} = require("../core/error.response");
const { shopService } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

const SALTROUNDS = 10;

class accessService {
  /**
   * 1 - check email in dbs
   * 2 - match password
   * 3 - Create AccessToken and RefreshToken
   * 4 - generate tokens
   * 5 - get data return signin
   */
  static signIn = async ({ email, password, refreshToken = null }) => {
    // 1 - check email in dbs
    const foundShop = await shopService.findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop is not registered!");
    }
    // 2 - match password
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authenticatio error!");
    // 3 - Create AccessToken and RefreshToken
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });
    // 4 - generate tokens
    const tokens = await createTokensPair(
      { userId: foundShop._id, email },
      publicKey, // PEM
      privateKey //PEM
    );

    // Lưu xuống db: Keys (lưu xuống db và đồng thời trả về 2 string publicKey và privateKey)
    await keyTokenService.createKeyToken({
      userId: foundShop._id,
      publicKey: publicKey,
      privateKey: privateKey,
      refreshToken: tokens.refreshToken,
    });
    // 5 - get data return signin
    return {
      shop: getInforData({
        fields: ["_id", "name", "email", "status", "roles"],
        object: foundShop,
      }),
      tokens: tokens,
    };
  };

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

      // create tokens pair
      const tokens = await createTokensPair(
        { userId: newShop._id, email: email },
        publicKey, // PEM
        privateKey //PEM
      );
      console.log(`Create tokens Success: `, tokens);

      // Lưu xuống db: Keys (lưu xuống db và đồng thời trả về 2 string publicKey và privateKey -> Cần đưa về format PEM để sử dụng cho việc tạo tokens)
      const keyStore = await keyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });
      if (!keyStore) {
        throw new BadRequestError("Error: keyStore error!");
      }
      // const publicKeyObject = crypto.createPublicKey(keyStore.publicKey);
      // const privateKeyObject = crypto.createPrivateKey(keyStore.privateKey);
      return {
        shop: getInforData({
          fields: ["_id", "name", "email", "status", "roles"],
          object: newShop,
        }),
        tokens: tokens,
      };
    } else {
      return {
        code: 200,
        metadata: null,
      };
    }
  };
  static signOut = async ({ keyStore }) => {
    const delKey = await keyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };
}

module.exports = accessService;
