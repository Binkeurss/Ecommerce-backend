require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const router = require("./routes");
const app = express();
const { initRedis } = require("./dbs/init.redis");
const redisPubSubService = require("./services/redisPubSub.service");

// Tắt ETag
app.disable("etag");

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// init Redis
initRedis();

// Test Pub/Sub Redis
async function startApp() {
  // Load and initialize subscriber first
  require("./tests/inventory.test");

  // Đợi một chút để đảm bảo subscriber đã sẵn sàng
  await new Promise(resolve => setTimeout(resolve, 500));

  // Then publish message
  const productTest = require("./tests/product.test");
  await productTest.purchaseProduct("product:001", 1);
}

startApp().catch(console.error);

// init db
require("./dbs/init.mongodb");

// init routes
app.use("/", router);

// handling error
app.use((req, res, next) => {
  const error = new Error("Not found router!");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server error!",
  });
});

module.exports = app;
