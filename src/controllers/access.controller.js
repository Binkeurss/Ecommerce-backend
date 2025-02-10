"use strict";

const accessService = require("../services/access.service");

class AccessController {
  handlerRefreshToken = async (req, res, next) => {
    //v1
    // const refreshToken = req.body.refreshToken;
    // try {
    //   let result = await accessService.handlerRefreshToken(refreshToken);
    //   return res.status(201).json({
    //     code: "201",
    //     metadata: result,
    //   });
    // } catch (error) {
    //   next(error);
    // }
    //v2
    try {
      const results = await accessService.handlerRefreshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      });
      return res.status(201).json({
        code: "201",
        metadata: results,
      });
    } catch (error) {
      next(error);
    }
  };

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

  signOut = async (req, res, next) => {
    try {
      const result = await accessService.signOut({ keyStore: req.keyStore });
      return res.status(200).json({
        code: "200",
        message: "Sign Out success!",
        metadata: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AccessController();
