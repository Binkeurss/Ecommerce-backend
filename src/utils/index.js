"use strict";

const _ = require("lodash");

const getInforData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

const getUnSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

/**
 * const a = {
 *  c: {
 *    d: 1
 *  }
 * }
 * 
 * db.collection.updateOne({
 *  `c.d`: 1
 * })
 */

const removeUndefinedNullObject = (obj) => {
  const results = {};
  Object.keys(obj).forEach((key) => {
    const current = obj[key];
    if ([null, undefined].includes(current)) {
      return;
    } else if (Array.isArray(current)) {
      return;
    } else if (typeof obj[key] === "object") {
      // props là 1 object
      const subResults = removeUndefinedNullObject(current);
      Object.keys(subResults).forEach((keySub) => {
        results[`${key}.${keySub}`] = subResults[keySub];
      });
      return;
    } else {
      // là một props bình thường
      results[key] = current;
    }
  });
  return results;
};

module.exports = {
  getInforData,
  getSelectData,
  getUnSelectData,
  removeUndefinedNullObject,
};
