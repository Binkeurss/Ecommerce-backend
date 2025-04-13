"use strict";

const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError, BadRequestError } = require("../core/error.response");
const keyTokenService = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "x-rtoken-id",
};

const createTokensPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "2 days", // hết hạn sau 2 ngày
    });

    const refreshToken = JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7 days",
    });

    const decoded = JWT.verify(accessToken, publicKey);
    console.log(`✅ Token verified successfully:`, decoded);

    return { accessToken, refreshToken };
  } catch (error) {
    console.error(`createTokensPair erorr: `, error);
  }
};

const authentication = asyncHandler(async (req, res, next) => {
  /**
   * 1 - Check userId missing?
   * 2 - get accessToken
   * 3 - verifyToken
   * 4 - check userId in dbs
   * 5 - check keyStore with this userId
   * 6 - OK all => retur next()
   */
  // 1 - Check userId missing?
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid request!");
  // 2 - get accessToken
  const keyStore = await keyTokenService.findByUserId(userId);
  if (!keyStore) {
    throw new NotFoundError("Not found keyStore!");
  }
  // 3 - verifyToken
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid request!");

  try {
    // console.log("keyStore: ", keyStore.publicKey);
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid userId!");
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const authenticationV2 = asyncHandler(
  async (req, res, next) => {
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError("Invalid request! (userId)");

    const keyStore = await keyTokenService.findByUserId(userId);
    if (!keyStore) {
      throw new NotFoundError("Not found keyStore!");
    }

    if (!keyStore.refreshToken) {
      throw new AuthFailureError("User does not Sign in!");
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) {
      throw new BadRequestError("Missing access token in headers");
    }

    const decoded = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decoded.userId) {
      throw new AuthFailureError("Invalid user in access token");
    }

    req.keyStore = keyStore;
    req.user = decoded;
    return next();
  },
  (error, req, res, next) => {
    // Xử lý lỗi từ asyncHandler
    if (error.name === "TokenExpiredError") {
      next(new AuthFailureError("Access token has expired"));
    } else if (error.name === "JsonWebTokenError") {
      next(new AuthFailureError("Invalid access token"));
    } else {
      next(error);
    }
  }
);

const verifyJWT = async (token, publicKey) => {
  const results = JWT.verify(token, publicKey);
  return results;
};

module.exports = {
  createTokensPair,
  authentication,
  verifyJWT,
  authenticationV2,
};
