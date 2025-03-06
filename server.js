const app = require("./src/app");

const PORT = process.env.PORT || 3056;

const server = app.listen(PORT, () => {
  console.log(`WSV Ecommerce start with ${PORT}`);
});

process.on("SIGINT", () => {
  server.close(() => console.log(`Exit server express`));
});

// "use strict";

// const express = require("express");
// const { createClient } = require("redis");

// const app = express();
// const PORT = process.env.PORT || 3056;

// // Tạo client Redis
// const redisClient = createClient();

// // Kết nối đến Redis
// (async () => {
//   try {
//     await redisClient.connect();
//     console.log("Kết nối Redis thành công");
//   } catch (err) {
//     console.error("Lỗi kết nối Redis:", err);
//     process.exit(1); // Dừng ứng dụng nếu không thể kết nối Redis
//   }
// })();

// // Đảm bảo đóng kết nối Redis khi ứng dụng tắt
// process.on("SIGINT", async () => {
//   await redisClient.quit();
//   console.log("Đã đóng kết nối Redis");
//   process.exit();
// });

// // Khởi động server
// const server = app.listen(PORT, () => {
//   console.log(`WSV Ecommerce bắt đầu với cổng ${PORT}`);
// });

// // Đảm bảo đóng server khi ứng dụng tắt
// process.on("SIGINT", () => {
//   server.close(() => {
//     console.log("Đã đóng server Express");
//   });
// });
