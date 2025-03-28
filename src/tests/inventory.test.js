const redisPubSubService = require("../services/redisPubSub.service");

class InventoryServiceTest {
  constructor() {
    this.initSubscription();
  }

  async initSubscription() {
    await redisPubSubService.subscribe(
      "purchase_events",
      async (channel, message) => {
        try {
          const order = JSON.parse(message);
          await InventoryServiceTest.updateInventory(order.productId, order.quantity);
        } catch (error) {
          console.error("Error processing message:", error); // Sửa 'err' thành 'error'
        }
      }
    );
  }

  static async updateInventory(productId, quantity) {
    console.log(`Update inventory ${productId} with quantity ${quantity}`);
    // Thêm logic cập nhật inventory thực tế tại đây
  }
}

module.exports = new InventoryServiceTest();
