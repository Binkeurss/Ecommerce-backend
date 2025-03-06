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

const getOrdersByUserId = async ({ order_userId, limit, skip, select }) => {
  const foundOrder = await orderModel
    .find({ order_userId: order_userId })
    .skip(skip)
    .limit(limit)
    .select(select);
  return foundOrder;
};

const getOrderByOrderId = async ({ orderId }) => {
  const foundOrder = await orderModel.findById(orderId);
  return foundOrder;
};

const patchUpdateStatusOrderByUser = async ({ userId, orderId, status }) => {
  const filter = {
    order_userId: userId,
    _id: orderId,
  };
  const update = {
    order_status: status,
  };
  const options = {
    upsert: true,
    new: true,
  };
  const updateOrder = await orderModel.findOneAndUpdate(
    filter,
    update,
    options
  );
  return updateOrder;
};

module.exports = {
  createNewOrder,
  getOrdersByUserId,
  getOrderByOrderId,
  patchUpdateStatusOrderByUser,
};
