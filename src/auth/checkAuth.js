"use strict";

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const { findApiKeyById } = require("../services/apikey.service");

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();

    if (!key) {
      return res.status(403).json({ message: "Forbidden Error" });
    }

    const objKey = await findApiKeyById(key);
    if (!objKey) {
      return res.status(403).json({ message: "Forbidden Error" });
    }

    req.objKey = objKey;
    next();
  } catch (error) {
    console.error("API Key Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      return res.status(403).json({ message: "Permisson denied!" });
    }
    console.log("permission: ", req.objKey.permissions);
    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) {
      return res.status(403).json({
        message: "Permission Denied!",
      });
    }
    return next();
  };
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    // Gọi hàm controller (fn), bắt lỗi Promise và chuyển đến middleware lỗi
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  apiKey,
  permission,
  asyncHandler
};
