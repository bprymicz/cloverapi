/**
 * Main application routes
 */
(function() {
  'use strict';

  module.exports = function(app) {

    // Insert routes below (swagger));
    // default handler
    app.use('/api/v1', require('./api/v1'));
    // End Routes  - DO NOT REMOVE COMMENT
  };
})();

