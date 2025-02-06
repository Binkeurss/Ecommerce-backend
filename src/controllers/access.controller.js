"use strict";

const accessService = require("../services/access.service");

class AccessController {
  signUp = async (req, res, next) => {
    try {
      /**
       * 200 OK
       * 201 CREATED
       */
      const { name, email, password } = req.body;
      let result = await accessService.signUp({name, email, password});
      return res.status(201).json({
        code: "20001",
        metadata: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AccessController();
