"use strict";

const statusCode = {
  OK: 200,
  CREATED: 201,
};

const ReasonStatusCode = {
  OK: "Success",
  CREATED: "Created!",
};

class SuccessResponse {
  constructor({
    message,
    statusCode = statusCode.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    metadata = {},
  }) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode;
    this.reasonStatusCode = reasonStatusCode;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({
    message,
    statusCode = statusCode.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    metadata,
  }) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor({
    message,
    statusCode = statusCode.CREATED,
    reasonStatusCode = ReasonStatusCode.CREATED,
    metadata,
  }) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}

module.exports = {
  OK,
  CREATED,
};
