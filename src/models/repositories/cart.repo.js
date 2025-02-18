const { cartModel } = require("../cart.model");
const { NotFoundError } = require("../../core/error.response");

const createUserCart = async ({ userId, product }) => {
  const query = { cart_userId: userId, cart_state: "active" };
  const updateOrInsert = {
    $addToSet: {
      cart_products: product,
    },
    $set: {
      cart_count_product: product.quantity,
    },
  };
  const options = {
    upsert: true, // Tạo mới giỏ hàng nếu không tìm thấy
    new: true, // Trả về document sau khi cập nhật
  };
  const results = await cartModel.findOneAndUpdate(
    query,
    updateOrInsert,
    options
  );
  return results;
};

const findCartByUserId = async ({ userId }) => {
  const results = cartModel.findOne({ cart_userId: userId });
  return results;
};

const updateUserCartQuantity = async ({ userId, product }) => {
  const { productId, quantity } = product;
  const query = {
    cart_userId: userId,
    "cart_products.productId": productId,
    cart_state: "active",
  };
  const updateSet = {
    $inc: {
      "cart_products.$.quantity": quantity,
      cart_count_product: quantity,
    },
  };
  const options = {
    new: true,
  };
  const results = await cartModel.findOneAndUpdate(query, updateSet, options);

  if (!results) {
    // no matching document found
    const updateInsert = {
      $push: { cart_products: product },
      $inc: { cart_count_product: quantity },
    };
    const insertQuery = {
      cart_userId: userId,
      cart_state: "active",
    };
    const options = {
      upsert: true,
      new: true,
    };
    const addResults = await cartModel.findOneAndUpdate(
      insertQuery,
      updateInsert,
      options
    );
    return addResults;
  }
  return results;
};

const removeAllProductInCart = async ({ userId, listProduct }) => {
  const query = {
    cart_userId: userId,
    cart_state: "active",
  };
  const updateQuery = {
    $pullAll: {
      cart_products: listProduct.cart_products,
    },
    $inc: {
      cart_count_product: -1 * listProduct.cart_count_product,
    },
  };
  const options = {
    new: true,
  };
  const results = await cartModel.updateOne(query, updateQuery, options);
  return results;
};

module.exports = {
  createUserCart,
  findCartByUserId,
  updateUserCartQuantity,
  removeAllProductInCart,
};
