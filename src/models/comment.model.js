"use strict";

const mongoose = require("mongoose");

const DOCUMENT_NAME = "Comment";
const COLLECTION_NAME = "Comments";

const commentSchema = new mongoose.Schema(
  {
    comment_productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    comment_userId: { type: Number, default: 1 },
    comment_content: { type: String, default: "comment" },
    comment_left: { type: Number, default: 0 },
    comment_right: { type: Number, default: 0 },
    comment_parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DOCUMENT_NAME,
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, commentSchema);
