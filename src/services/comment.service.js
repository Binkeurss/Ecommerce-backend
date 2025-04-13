"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const commentModel = require("../models/comment.model");
const { findProductById } = require("../models/repositories/product.repo");
const {
  findCommentById,
  findMaxRightValue,
  createComment,
  updateCommentRightParents,
  updateCommentLeftParents,
  findCommentsByParentId,
  findRootCommentsByProductId,
  findAllCommentsByProductId,
  deleteManyComments,
  updateDeleteManyComments,
} = require("../models/repositories/comment.repo");

/**
 * Add comment [USER | SHOP]
 * Get a list of comments [USER | SHOP]
 * delete a comment [USER | SHOP | ADMIN]
 */

class CommentService {
  static async createComment({
    productId,
    userId,
    content,
    parentCommentId = null,
  }) {
    if (productId) {
      const foundProduct = await findProductById({
        product_id: productId,
      });
      if (!foundProduct) {
        throw new NotFoundError("Product is not existed!");
      }
    }
    if (String(content).length === 0) {
      throw new BadRequestError("Length of content must be greater than 0!");
    }
    if (parentCommentId) {
      const foundParentComment = await findCommentById({
        commentId: parentCommentId,
      });
      if (!foundParentComment) {
        throw new NotFoundError("Parent comment is not existed!");
      }
    }
    // Bắt đầu logic
    let rightValue;
    if (parentCommentId) {
      // Nếu khác null, đây là comment reply
      const foundParentComment = await findCommentById({
        commentId: parentCommentId,
      });
      rightValue = foundParentComment.comment_right;
      //Update node
      const updateCommentRightParentsResult = await updateCommentRightParents({
        productId: productId,
        rightValue: rightValue,
      });
      const updateCommentLeftParentsResult = await updateCommentLeftParents({
        productId: productId,
        rightValue: rightValue,
      });
      if (
        !(updateCommentRightParentsResult && updateCommentLeftParentsResult)
      ) {
        throw new BadRequestError("Can't update parent comments!");
      }
    } else {
      const maxRightValue = await findMaxRightValue({
        comment_productId: productId,
      });
      if (maxRightValue) {
        rightValue = maxRightValue + 1;
      } else {
        rightValue = 1;
      }
    }
    // insert comment
    const dataPayload = {
      comment_productId: productId,
      comment_userId: userId,
      comment_content: content,
      comment_parentId: parentCommentId,
      comment_left: rightValue,
      comment_right: rightValue + 1,
    };

    const newComment = await createComment(dataPayload);
    return newComment;
  }

  static async getCommentsByParentId({
    productId,
    parentCommentId = null,
    limit = 50,
    offset = 0,
  }) {
    if (productId) {
      const foundProduct = await findProductById({
        product_id: productId,
      });
      if (!foundProduct) {
        throw new NotFoundError("Product is not existed!");
      }
    } else {
      throw new BadRequestError("Need productId to find comments!");
    }
    if (parentCommentId) {
      const foundParentComment = await findCommentById({
        commentId: parentCommentId,
      });
      if (!foundParentComment) {
        throw new NotFoundError("Not found comment for product!");
      }

      const listComments = await findCommentsByParentId({
        productId: productId,
        parentCommentId: parentCommentId,
      });
      return listComments;
    } else throw new BadRequestError("Need parentCommentId to find comments!");
  }

  static async getRootCommentsByProductId({ productId }) {
    if (productId) {
      const foundProduct = await findProductById({
        product_id: productId,
      });
      if (!foundProduct) {
        throw new NotFoundError("Product is not existed!");
      }
    } else {
      throw new BadRequestError("Need productId to find comments!");
    }
    // root comments
    const listRootComments = await findRootCommentsByProductId({
      productId: productId,
    });
    return listRootComments;
  }

  static async getAllCommentsByProductId({ productId }) {
    if (productId) {
      const foundProduct = await findProductById({
        product_id: productId,
      });
      if (!foundProduct) {
        throw new NotFoundError("Product is not existed!");
      }
    } else {
      throw new BadRequestError("Need productId to find comments!");
    }
    const listComments = await findAllCommentsByProductId({
      productId: productId,
    });
    return listComments;
  }

  static async deleteCommentsByCommentId({ productId, commentId }) {
    const foundProduct = await findProductById({ product_id: productId });
    if (!foundProduct) {
      throw new NotFoundError("Product is not existed!");
    }
    const foundComment = await findCommentById({ commentId: commentId });
    if (!foundComment) {
      throw new NotFoundError("Comment is not existed!");
    }
    const leftValue = foundComment.comment_left;
    const rightValue = foundComment.comment_right;
    const width = rightValue - leftValue + 1;
    const result_delete = await deleteManyComments({
      productId: productId,
      commentLeft: leftValue,
      commentRight: rightValue,
    });
    const results_update = await updateDeleteManyComments({
      productId: productId,
      commentRight: rightValue,
      width: width,
    });
    return {
      delete: result_delete,
      update: results_update,
    };
  }
}

module.exports = CommentService;
