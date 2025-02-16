"use strict";

const { BadRequestError } = require("../core/error.response");
const {
  productModel,
  clothingModel,
  electronicsModel,
  furnitureModel,
} = require("../models/product.model");
const { insertInventory } = require("../models/repositories/inventory.repo");
const {
  findAllDraftsForShop,
  publishProductByShop,
  findAllPublishedForShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProductById,
  updateProductById,
} = require("../models/repositories/product.repo");

const { removeUndefinedNullObject } = require("../utils");

class ProductFactoryStrategy {
  /**
   * type: 'Clothing', ...
   * data: payload
   */

  // strategy
  static productRegistry = {}; //key-class

  static registerProductType(type, classRef) {
    this.productRegistry[type] = classRef;
  }
  // Factory Method + Strategy
  static async createProduct(type, payload) {
    // console.log("type Register: ", type);
    const productClass = this.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(
        `Invalid Product type: ${type} (createProduct)`
      );
    return new productClass(payload).createProduct();
  }

  static async updateProduct(type, product_id, payload) {
    console.log("type Register: ", type);
    const productClass = this.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(
        `Invalid Product type: ${type} (updateProduct)`
      );
    return new productClass(payload).updateProduct(product_id);
  }

  // get all drafts
  static async findAllDraftsForShop({ product_shop, limit = 50, skip }) {
    const query = { product_shop, isDraft: true };
    const results = await findAllDraftsForShop({ query, limit, skip });
    return results;
  }

  // get all publishs
  static async findAllPublishedForShop({ product_shop, limit = 50, skip }) {
    const query = { product_shop, isPublished: true };
    const results = await findAllPublishedForShop({ query, limit, skip });
    return results;
  }
  // publish a product by seller
  static async publishProductByShop({ product_shop, product_id }) {
    const results = await publishProductByShop({ product_shop, product_id });
    return results;
  }
  // unPublish a product by seller
  static async unPublishProductByShop({ product_shop, product_id }) {
    const results = await unPublishProductByShop({ product_shop, product_id });
    return results;
  }

  static async searchProducts({ keySearch }) {
    const results = await searchProductByUser({ keySearch });
    return results;
  }

  // Find all products
  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    skip = 0,
    filter = { isPublished: true },
  }) {
    const results = await findAllProducts({
      limit: limit,
      sort: sort,
      skip: skip,
      filter: filter,
      select: ["product_name", "product_price", "product_thumb"],
    });
    return results;
  }
  // Find product by id
  static async findProductById({ product_id }) {
    const results = await findProductById({ product_id, unSelect: ["__v"] });
    return results;
  }
}

/**
  product_name: { type: String, required: true },
  product_thumb: { type: String, required: true },
  product_description: String,
  product_price: { type: Number, required: true },
  product_quantity: { type: Number, required: true },
  product_type: {
    type: String,
    required: true,
    enum: ["Electronics", "Clothing", "Furniture"],
  },
  product_shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  product_attribute: { type: mongoose.Schema.Types.Mixed, required: true },
 */

// define base class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attribute,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attribute = product_attribute;
  }

  // Create new product
  async createProduct(product_id) {
    let newProduct = await productModel.create({ ...this, _id: product_id });
    if (newProduct) {
      // add product_stock in inventory collection
      const dataInventory = {
        productId: newProduct._id,
        shopId: newProduct.product_shop,
        stock: newProduct.product_quantity,
      };
      await insertInventory(dataInventory);
    }
    return newProduct;
  }

  // Update product
  async updateProduct(product_id, payload) {
    const results = await updateProductById({
      product_id,
      payload,
      model: productModel,
    });
    return results;
  }
}

// define sub-class for different product types: Clothing
class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothingModel.create({
      ...this.product_attribute,
      product_shop: this.product_shop,
    });
    if (!newClothing) throw new BadRequestError("Create new Clothing error!");
    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError("Create new Product error!");
    return newProduct;
  }

  async updateProduct(product_id) {
    // 1. remove attr has null underfined
    // 2. check xem update ở đâu?
    const payload = this;
    console.log(payload);
    if (payload.product_attribute) {
      // update tại bảng clothing trước
      await updateProductById({
        product_id,
        payload: removeUndefinedNullObject(payload.product_attribute),
        model: clothingModel,
      });
    }
    // update tại bảng products
    const updateResults = await super.updateProduct(
      product_id,
      removeUndefinedNullObject(payload)
    );
    return updateResults;
  }
}

// define sub-class for different product types: Electronics
class Electronics extends Product {
  async createProduct() {
    const newElectronics = await electronicsModel.create({
      ...this.product_attribute,
      product_shop: this.product_shop,
    });
    if (!newElectronics)
      throw new BadRequestError("Create new electronics erorr!");
    const newProduct = await super.createProduct(newElectronics._id);
    if (!newProduct) throw new BadRequestError("Create new Product error!");
    return newProduct;
  }
  async updateProduct(product_id) {
    // Kiểm tra payload có product_attribute hay không
    // Check xem update ở đâu
    const payload = this;
    if (payload.product_attribute) {
      // Update tại collection Electronics
      await updateProductById({
        product_id: product_id,
        payload: removeUndefinedNullObject(payload.product_attribute),
        model: electronicsModel,
      });
    }
    // Update tại bảng product
    const updateProduct = await super.updateProduct(
      product_id,
      removeUndefinedNullObject(payload)
    );
    return updateProduct;
  }
}

// define sub-class for different product types: Furniture
class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furnitureModel.create({
      ...this.product_attribute,
      product_shop: this.product_shop,
    });
    if (!newFurniture) throw new BadRequestError("Create new furniture error!");
    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError("Create new Product error!");
    return newProduct;
  }

  async updateProduct(product_id) {
    const payload = this;
    if (payload.product_attribute) {
      const payloadFurniture = removeUndefinedNullObject(
        payload.product_attribute
      );
      await updateProductById({
        product_id: product_id,
        payload: payloadFurniture,
        model: furnitureModel,
      });
    }
    const updateProduct = await super.updateProduct(
      product_id,
      removeUndefinedNullObject(payload)
    );
    return updateProduct;
  }
}

// register productType
ProductFactoryStrategy.registerProductType("Clothing", Clothing);
ProductFactoryStrategy.registerProductType("Electronics", Electronics);
ProductFactoryStrategy.registerProductType("Furniture", Furniture);

module.exports = ProductFactoryStrategy;
