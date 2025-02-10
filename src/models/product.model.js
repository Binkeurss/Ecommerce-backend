"use strict";

const mongoose = require("mongoose");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const productShema = new mongoose.Schema(
  {
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
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

// define the product type = clothing
const clothingSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collection: "clothing",
    timestamps: true,
  }
);

// define the product type = electronics
const electronicsSchema = new mongoose.Schema(
  {
    manufacturer: { type: String, required: true },
    model: String,
    color: String,
    product_shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collection: "electronics",
    timestamps: true,
  }
);

// define the product type = Furniture
const furnitureSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
    product_shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    collection: "furniture",
    timestamps: true,
  }
);

module.exports = {
  productModel: mongoose.model(DOCUMENT_NAME, productShema),
  clothingModel: mongoose.model("Clothing", clothingSchema),
  electronicsModel: mongoose.model("Electronics", electronicsSchema),
  furnitureModel: mongoose.model("Furniture", furnitureSchema),
};
