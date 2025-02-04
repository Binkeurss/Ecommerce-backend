"use strict";

const JWT = require("jsonwebtoken");

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

module.exports = {
  createTokensPair,
};
