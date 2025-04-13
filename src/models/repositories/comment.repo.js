"use strict";

const commentModel = require("../comment.model");

const findCommentById = async ({ commentId }) => {
  const foundCommnet = await commentModel.findOne({ _id: commentId }).lean();
  return foundCommnet;
};

const findMaxRightValue = async ({ comment_productId }) => {
  const foundCommentProduct = commentModel.findOne(
    {
      comment_productId: comment_productId,
    },
    "comment_right",
    { sort: { comment_right: -1 } }
  );
  return foundCommentProduct;
};

const createComment = async ({
  comment_productId,
  comment_userId,
  comment_content,
  comment_left,
  comment_right,
  comment_parentId,
}) => {
  const newComment = commentModel.create({
    comment_productId: comment_productId,
    comment_userId: comment_userId,
    comment_content: comment_content,
    comment_left: comment_left,
    comment_right: comment_right,
    comment_parentId: comment_parentId,
  });
  return newComment;
};

const updateCommentRightParents = async ({ productId, rightValue }) => {
  const results = await commentModel.updateMany(
    {
      comment_productId: productId,
      comment_right: { $gte: rightValue },
    },
    {
      $inc: { comment_right: 2 },
    }
  );
  return results;
};

const updateCommentLeftParents = async ({ productId, rightValue }) => {
  const results = await commentModel.updateMany(
    {
      comment_productId: productId,
      comment_left: { $gt: rightValue },
    },
    {
      $inc: { comment_left: 2 },
    }
  );
  return results;
};

const findCommentsByParentId = async ({ productId, parentCommentId }) => {
  const foundComment = await findCommentById({ commentId: parentCommentId });
  const results = await commentModel
    .find({
      comment_productId: productId,
      comment_left: { $gt: foundComment.comment_left },
      comment_right: { $lte: foundComment.comment_right },
    })
    .sort({ comment_left: 1 });
  return results;
};

const findRootCommentsByProductId = async ({ productId }) => {
  const results = await commentModel
    .find({
      comment_productId: productId,
      comment_parentId: null,
    })
    .sort({ comment_left: 1 });
  return results;
};

const findAllCommentsByProductId = async ({ productId }) => {
  const results = await commentModel
    .find({
      comment_productId: productId,
    })
    .sort({ comment_left: 1 });
  return results;
};

const deleteManyComments = async ({ productId, commentLeft, commentRight }) => {
  const results = await commentModel.deleteMany({
    comment_productId: productId,
    comment_left: { $gte: commentLeft },
    comment_right: { $lte: commentRight },
  });
  return results;
};

const updateDeleteManyComments = async ({ productId, commentRight, width }) => {
  const results_left = await commentModel.updateMany(
    {
      comment_productId: productId,
      comment_left: { $gt: commentRight },
    },
    {
      $inc: { comment_left: -1 * width },
    }
  );
  const results_right = await commentModel.updateMany(
    {
      comment_productId: productId,
      comment_right: { $gt: commentRight },
    },
    {
      $inc: { comment_right: -1 * width },
    }
  );
  return { results_left: results_left, results_right: results_right };
};

module.exports = {
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
};
