
angular.module('cloverApp', [
  /* angular */
    /*'ngAnimate',
    'ngSanitize',*/
    /* vendor */
    /* app */
    'cloverApp.services.clover'
  ])

  .config(configImpl)
  .controller('Landing', Landing);


/**
 * @method configImpl
 * @description config implementation details
 */
function configImpl() {
  //todo: all the things
}

function Landing($scope, cloverService){
  cloverService.getTaps().then(function(updatedTaps){
    $scope.taps = updatedTaps;
  });
  cloverService.getInventory().then(function(updatedInventory){
    $scope.beerInventory = updatedInventory;
  });
}