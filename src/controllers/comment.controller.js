"use strict";

const CommentService = require("../services/comment.service");

class CommentController {
  postCreateComment = async (req, res, next) => {
    const { productId, userId, content, parentCommentId } = req.body;
    try {
      const results = await CommentService.createComment({
        productId: productId,
        userId: userId,
        content: content,
        parentCommentId: parentCommentId,
      });
      return res.status(201).json({
        code: "201",
        message: "Create new comment successfully!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

  getCommentsByParentId = async (req, res, next) => {
    const { productId, parentCommentId } = req.query;
    try {
      const results = await CommentService.getCommentsByParentId({
        productId: productId,
        parentCommentId: parentCommentId,
      });
      return res.status(200).json({
        code: "200",
        message: "Get list comments by parentId",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

  getRootCommentsByProductId = async (req, res, next) => {
    const { productId } = req.params;
    try {
      const results = await CommentService.getRootCommentsByProductId({
        productId: productId,
      });
      return res.status(200).json({
        code: "200",
        message: "Get list root comments by productId",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllCommentsByProductId = async (req, res, next) => {
    const { productId } = req.params;
    try {
      const results = await CommentService.getAllCommentsByProductId({
        productId: productId,
      });
      return res.status(200).json({
        codt: "200",
        message: "Get all comments by productId",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCommentsByCommentId = async (req, res, next) => {
    const { productId, commentId } = req.query;
    try {
      const results = await CommentService.deleteCommentsByCommentId({
        productId: productId,
        commentId: commentId,
      });
      return res.status(201).json({
        code: "201",
        message: "Delete comments successfully!",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new CommentController();
