"use strict";

const loggerService = require("../loggers/discord.log.v2");

const pushToLogDiscord = async (req, res, next) => {
  try {
    await loggerService.sendToFormatCode({
      title: `Method: ${req.method}`,
      code: req.method === 'GET' ? req.query : req.body,
      message: `${req.get('host')}${req.originalUrl}`,
    });
    return next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  pushToLogDiscord
}
