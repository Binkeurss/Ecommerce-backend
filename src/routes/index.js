"use strict";

const express = require("express");
const router = express.Router();
const accessRouter = require("./access");

router.use("/v1/api", accessRouter);

module.exports = router;
