"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keyTokenService = require("./keyToken.service");
const { createTokensPair, verifyJWT } = require("../auth/authUtils");
const { getInforData } = require("../utils");
const {
  BadRequestError,
  ForbiddenError,
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
      const refreshToken = tokens.refreshToken;
      const keyStore = await keyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
        refreshToken
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

  /**
   * check this token used?
   *
   */
  static handlerRefreshToken = async (refreshToken) => {
    // Check xem token đã được sử dụng chưa
    const foundToken = await keyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    // Nếu có
    if (foundToken) {
      // Decode who use this used refreshToken
      // Tại sao lại là userId, email => Vì lúc sign để tạo ra RT và AT thì payload được gửi gồm userId và email
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.publicKey
      );
      console.log("[1]--: ", { userId, email });
      await keyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happend! Please reSignIn!");
    }

    // Nếu không, bình thường
    const holderToken = await keyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError("Shop not registed!");
    // verifyToken
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.publicKey
    );
    console.log("[2]--: ", { userId, email });
    // check userId
    const foundShop = await shopService.findByEmail({ email });
    if (!foundShop)
      throw new AuthFailureError("Shop not registed! (foundShop)");

    // create 1 cặp Token mới
    const newTokens = await createTokensPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );
    // update token
    await keyTokenService.updateRefreshTokenById(
      userId,
      refreshToken,
      newTokens.refreshToken
    );
    return {
      user: { userId, email },
      newTokens,
    };
  };
}

module.exports = accessService;
