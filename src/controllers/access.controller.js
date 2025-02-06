"use strict";

const accessService = require("../services/access.service");

class AccessController {
  signIn = async (req, res, next) => {
    try {
      // const { email, password } = req.body;
      let result = await accessService.signIn(req.body);
      return res.status(201).json({
        code: "201",
        metadata: result,
      });
    } catch (error) {
      next(error);
    }
  };
  signUp = async (req, res, next) => {
    try {
      /**
       * 200 OK
       * 201 CREATED
       */
      const { name, email, password } = req.body;
      let result = await accessService.signUp({ name, email, password });
      return res.status(201).json({
        code: "201",
        metadata: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AccessController();
