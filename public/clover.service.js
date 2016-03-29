/**
 * @module *.services.facebook
 * @file wrapper for the Facebook service
 */
angular.module('cloverApp.services.clover', [])
  .service('cloverService', function($sce, $q, $log, $http) {

    var taps = [{'name': 'name 1', value: 6.20},{'name': 'name 2', value: 5.20}];
    var inventory = [{'name': 'name 1', value: 6.20},{'name': 'name 2', value: 5.20}];
    var config = { url: 'localhost.com',
                  port: 5000};
    return {
      getTaps: getTaps,
      getInventory: getInventory
    };

    function getTaps() {
      return $http.get('/taps', config).then(function(resp) {
        taps = resp.data.elements;
        return taps;
      }, function(err) {
        console.log(err);
        return err;
      });
    }

    function getInventory() {
      return $http.get('/inventory', config).then(function(resp) {
        inventory = resp.data.elements;
        return inventory;
      }, function(err) {
        console.log(err);
        return err;
      });
    }

  });