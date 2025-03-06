const { orderModel } = require("../../models/order.model");

const createNewOrder = async ({
  order_userId,
  order_checkout,
  order_shipping,
  order_payment,
  order_products,
}) => {
  const newOrder = await orderModel.create({
    order_userId: order_userId,
    order_checkout: order_checkout,
    order_shipping: order_shipping,
    order_payment: order_payment,
    order_products: order_products,
  });
  return newOrder;
};

module.exports = {
  createNewOrder,
};
