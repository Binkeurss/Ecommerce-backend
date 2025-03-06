"use strict";

const { RedisErrorResponse } = require("../core/error.response");
const redis = require("redis");

// Singleton client
let client = null;
let connectTimeout = null;

// Trạng thái kết nối Redis
const statusConnectRedis = {
  CONNECT: "connect",
  END: "end",
  RECONNECT: "reconnecting",
  ERROR: "error",
};

const REDIS_CONNECT_TIMEOUT = 10000;
const REDIS_CONNECT_MESSAGE = {
  code: -99,
  message: {
    vn: "Redis có lỗi!",
    en: "Service Redis connect error!",
  },
};

const handleTimeoutErorr = () => {
  connectTimeout = setTimeout(() => {
    throw new RedisErrorResponse({
      message: REDIS_CONNECT_MESSAGE.message.vn,
      statusCode: REDIS_CONNECT_MESSAGE.code,
    });
  }, REDIS_CONNECT_TIMEOUT);
};

// Xử lý các sự kiện kết nối Redis
const handleEventConnectRedis = ({ connectionRedis }) => {
  connectionRedis.on(statusConnectRedis.CONNECT, () => {
    console.log(`connectionRedis - Connection status: connected!!!`);
    clearTimeout(connectTimeout);
  });

  connectionRedis.on(statusConnectRedis.END, () => {
    console.log(`connectionRedis - Connection status: disconnected!!!`);
    // connect retry
    handleTimeoutErorr();
  });

  connectionRedis.on(statusConnectRedis.RECONNECT, () => {
    console.log(`connectionRedis - Connection status: reconnecting!!!`);
    clearTimeout(connectTimeout);
  });

  connectionRedis.on(statusConnectRedis.ERROR, (err) => {
    console.error(`connectionRedis - Connection status: error: ${err}`);
    handleTimeoutErorr();
  });
};

const initRedis = async () => {
  client = redis.createClient({
    host: "172.17.0.2", // hoặc tên mạng nếu bạn sử dụng Docker Compose
    port: 6379,
  });

  handleEventConnectRedis({ connectionRedis: client });
  handleTimeoutErorr();
  try {
    await client.connect();
    console.log("Redis client connected successfully.");
    clearTimeout(connectTimeout);
  } catch (error) {
    console.error("Redis client connection failed:", error);
    throw error;
  }
};

const getRedis = () => {
  return client;
};

const closeRedis = async () => {
  try {
    await client.quit();
    console.log("Disconnected Redis successfully.");
    client = null;
  } catch (error) {
    console.error("Error while disconnecting Redis:", error);
    throw error;
  }
};

module.exports = {
  initRedis,
  getRedis,
  closeRedis,
};
