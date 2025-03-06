"use strict";

const {
  reservationInventory,
} = require("../models/repositories/inventory.repo");
const { getRedis } = require("../dbs/init.redis");
const { RedisErrorResponse } = require("../core/error.response");
const crypto = require("crypto");

// Giữ lại khi một người đang thanh toán, không cho người khác thanh toán nữa
// Không truy cập Redis ngay lúc import, mà sẽ truy cập khi các function được gọi
const acquireLock = async (productId, quantity, cartId) => {
  const redisClient = getRedis();
  if (!redisClient) {
    throw new RedisErrorResponse("Redis client not initialized");
  }

  const key = `lock_v2025_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000;
  const uniqueValue = crypto.randomUUID(); // Tạo unique ID

  for (let i = 0; i < retryTimes; i++) {
    // Atomic set key + expiration
    const result = await redisClient.set(
      key,
      uniqueValue,
      "PX",
      expireTime,
      "NX"
    );
    if (result === "OK" || result === true) {
      try {
        console.log("Hehe redis! + i: ", i);
        const isReservation = await reservationInventory({
          productId: productId,
          quantity: quantity,
          cartId: cartId,
        });

        if (isReservation.modifiedCount) {
          return { key, uniqueValue }; // Trả cả value để xóa đúng sau này
        } else {
          await redisClient.del(key); // Xóa lock nếu reserve thất bại
          return null;
        }
      } catch (error) {
        await redisClient.del(key); // Xóa lock nếu có lỗi
        throw error;
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Giảm thời gian chờ
    }
  }
  throw new Error("Cannot acquire lock after retries");
};

const releaseLock = async (key, uniqueValue) => {
  const redisClient = getRedis();
  if (!redisClient) {
    throw new RedisErrorResponse("Redis client not initialized");
  }
  const currentValue = await await redisClient.get(key);
  if (currentValue === uniqueValue) {
    await redisClient.del(key);
  }
};

module.exports = {
  acquireLock,
  releaseLock,
};
