const { cartModel } = require("../cart.model");
const { NotFoundError, BadRequestError } = require("../../core/error.response");
const { findProductById } = require("./product.repo");
const {
  addProductToDetailCart,
  updateQuantityProductDetailCart,
  getListProductsInDetailCartByCartId,
} = require("./detailCart.repo");

const createUserCart = async ({ userId, products = [] }) => {
  const newCart = await cartModel.create({ cart_userId: userId });
  let results = [];
  for (let i = 0; i < products.length; i++) {
    const { productId, quantity } = products[i];
    let foundProduct = await findProductById({
      product_id: productId,
    });

    if (!foundProduct.product_price) {
      throw BadRequestError("Invalid unitPrice!");
    }
    const resultItem = await addProductToDetailCart({
      cartId: newCart._id,
      productId: productId,
      quantity: quantity,
      unitPrice: foundProduct.product_price,
      shopId: foundProduct.product_shop,
    });
    if (resultItem) {
      results.push(resultItem);
    }
  }
  return results;
};

const findCartByUserId = async ({ userId }) => {
  const results = cartModel.findOne({ cart_userId: userId });
  return results;
};

const updateUserCartQuantity = async ({ cartId, products = [] }) => {
  let results = [];
  for (let i = 0; i < products.length; i++) {
    const { productId, quantity } = products[i];
    let foundProduct = await findProductById({
      product_id: productId,
    });
    if (!foundProduct.product_price) {
      throw BadRequestError("Invalid unitPrice!");
    }
    const resultItem = await updateQuantityProductDetailCart({
      cartId: cartId,
      productId: productId,
      quantity: quantity,
      productPrice: foundProduct.product_price,
      shopId: foundProduct.product_shop,
    });
    if (resultItem) {
      results.push(resultItem);
    }
  }
  return results;
};

const findCartById = async ({ cartId }) => {
  const results = await cartModel
    .findOne({
      _id: cartId,
      cart_state: "active",
    })
    .lean();
  return results;
};

const getListProductsInCart = async ({ cartId }) => {
  const results = await getListProductsInDetailCartByCartId({ cartId: cartId });
  return results;
};

const checkProductByServer = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await findProductById({
        product_id: product.productId,
      });
      if (foundProduct) {
        return {
          price: foundProduct.product_price,
          quantity: product.quantity,
          productId: foundProduct._id,
        };
      }
    })
  );
};

module.exports = {
  createUserCart,
  findCartByUserId,
  updateUserCartQuantity,
  findCartById,
  checkProductByServer,
  getListProductsInCart,
};
