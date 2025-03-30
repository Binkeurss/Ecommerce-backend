const express = require("express");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");
const CommentController = require("../../controllers/comment.controller");

router.use(authenticationV2);
router.post("/comment", asyncHandler(CommentController.postCreateComment));
router.get(
  "/comments/:productId",
  asyncHandler(CommentController.getRootCommentsByProductId)
);
router.get(
  "/comments-parentId",
  asyncHandler(CommentController.getCommentsByParentId)
);
router.get(
  "/comments-all/:productId",
  asyncHandler(CommentController.getAllCommentsByProductId)
);
router.delete("/comments", asyncHandler(CommentController.deleteCommentsByCommentId));

module.exports = router;
