"use strict";

const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const keyTokenService = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CILENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "x-rtoken-id",
};

const createTokensPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "2 days", // hết hạn sau 2 ngày
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`Error verify: `, err);
      } else {
        console.log(`Decode verify: `, decode);
      }
    });
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
  const userId = req.headers[HEADER.CILENT_ID];
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

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /**
   * 1 - Check userId missing?
   * 2 - get accessToken
   * 3 - verifyToken
   * 4 - check userId in dbs
   * 5 - check keyStore with this userId
   * 6 - OK all => retur next()
   */
  // 1 - Check userId missing?
  const userId = req.headers[HEADER.CILENT_ID];
  if (!userId) throw new AuthFailureError("Invalid request! (userId)");
  // 2 - get keyStore (Keys)
  const keyStore = await keyTokenService.findByUserId(userId);
  if (!keyStore) {
    throw new NotFoundError("Not found keyStore!");
  }
  // 3 - verifyToken
  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN];
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      // decode để kiếm userId được lưu trong payload của refreshToken
      if (userId !== decodeUser.userId)
        throw new AuthFailureError("Invalid user! (userId !== decoder.userId)");
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }
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
