const { createClient } = require("redis"); // Thay đổi cách import

class RedisPubSubService {
  constructor() {
    this.publisher = createClient();
    this.subscriber = createClient();

    // Thêm sự kiện kết nối
    this.publisher.on("connect", () => console.log("Publisher connected")); // Chưa chạy ngay, chỉ đăng ký
    this.subscriber.on("connect", () => console.log("Subscriber connected")); // Chưa chạy ngay, chỉ đăng ký
    // Đăng ký sự kiện error
    this.publisher.on("error", (err) => console.error("Publisher Error:", err)); // Chưa chạy ngay, chỉ đăng ký
    this.subscriber.on("error", (err) =>
      console.error("Subscriber Error:", err)
    ); // Chưa chạy ngay, chỉ đăng ký

    this.connect();
  }

  async connect() {
    await this.publisher.connect(); // Bắt đầu kết nối publisher
    await this.subscriber.connect();
    console.log("Redis PubSub clients connected!");
  }

  async publish(channel, message) {
    return await this.publisher.publish(channel, message);
  }

  async subscribe(channel, callback) {
    // Sửa lại cách subscribe cho Redis v4+
    await this.subscriber.subscribe(channel, (message, receivedChannel) => {
      if (channel === receivedChannel) {
        callback(receivedChannel, message);
      }
    });
  }
}

const redisPubSubService = new RedisPubSubService();
module.exports = redisPubSubService;
