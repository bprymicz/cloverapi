'use strict';
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
var express = require('express');
var controller = require('./api.v1.controller.js');

module.exports = function() {

  /*******************************
   * Routes Config
   *******************************/

  var router = express.Router();

  /*
   * Standard Routes
   */
  router.get('/*?', controller.get);
  //router.post('/*?', controller.post);
  //router.delete('/*?', controller.destroy);
  //router.put('/*?', controller.put);

  return router;
};