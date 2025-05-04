"use strict";

const userModel = require("../models/user.model");
const JWT = require("jsonwebtoken");
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
const { userService } = require("./user.service");
const {
  findKeyTokenByUserId,
} = require("../models/repositories/keyToken.repo");

const RoleShop = ["SHOP", "WRITER", "EDITOR", "ADMIN", "CUSTOMER"];

const SALTROUNDS = 10;

class accessService {
  /**
   * 1 - check email in dbs
   * 2 - match password
   * 3 - Create AccessToken and RefreshToken
   * 4 - generate tokens
   * 5 - get data return signin
   */
  static signIn = async ({ email, password }) => {
    // 1 - check email in dbs
    const foundShop = await userService.findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop is not registered!");
    }
    console.log("foundShop: ", foundShop);
    // 2 - match password
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authenticatio error!");
    // 3 - Create AccessToken and RefreshToken
    let publicKey, privateKey;
    const keyStore = await findKeyTokenByUserId({ userId: foundShop._id });
    if (!keyStore) {
      const { privateKey: newPrivateKey, publicKey: newPublicKey } =
        crypto.generateKeyPairSync("rsa", {
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
      publicKey = newPublicKey;
      privateKey = newPrivateKey;
    } else {
      publicKey = keyStore.publicKey;
      privateKey = keyStore.privateKey;
    }
    // 4 - generate tokens
    const tokens = await createTokensPair(
      { userId: foundShop._id, email },
      publicKey, // PEM
      privateKey //PEM
    );

    // Lưu xuống db: Keys (lưu xuống db và đồng thời trả về 2 string publicKey và privateKey và refreshToken)
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

  static signUp = async ({ name, email, password, role }) => {
    // step 1: check email exists?
    const holderShop = await userModel.findOne({ email: email }).lean(); // lean sẽ trả về 1 object JS thuần tuý, size < 30 lần
    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered!");
    }
    if (!Object.values(RoleShop).includes(role)) {
      throw new BadRequestError("Error: Role is not existed!");
    }
    const passwordHash = await bcrypt.hash(password, SALTROUNDS);
    const newUser = await userModel.create({
      name: name,
      email: email,
      password: passwordHash,
      roles: [role],
    });
    if (newUser) {
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
        refreshToken,
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
    const signOutKey = await keyTokenService.removeKeyByIdSignOut(keyStore);
    return signOutKey;
  };

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
    const foundShop = await userService.findByEmail({ email });
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

  static handlerRefreshTokenV2 = async ({ refreshToken, userId }) => {
    console.log("refreshToken: ", refreshToken);
    // Find keyStore
    const keyStore = await keyTokenService.findByUserId(userId);
    if (!keyStore) {
      throw new NotFoundError("KeyStore not found");
    }

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await keyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happend! Please reSignIn!");
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("RefreshToken is not correct!");
    }

    // Decode refreshToken to get user info
    let email;
    try {
      const decoded = JWT.verify(refreshToken, keyStore.publicKey);
      if (userId !== decoded.userId) {
        throw new AuthFailureError("Invalid user in refresh token");
      }
      email = decoded.email;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new AuthFailureError("Refresh token has expired");
      }
      throw new AuthFailureError(
        `Refresh token verification failed: ${error.message}`
      );
    }

    // Verify shop exists
    const foundShop = await userService.findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError("Shop not registered!");
    }

    // Create new tokens
    const newTokens = await createTokensPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    // Update refreshToken with rotation
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
