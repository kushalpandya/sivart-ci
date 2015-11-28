/**
 * sivart-ci v0.1.0
 *
 * A simple interactive CI Dashboard built on MEAN stack.
 *
 * Author: Kushal Pandya <kushalspandya@gmail.com> (https://doublslash.com)
 * Date: 27 November, 2015
 *
 * Sivart CI Angular App.
 */

(function() {
    var sivartCI = angular.module('sivartCI', []);

    /*
     * Declare App Controllers
     */
    sivartCI.controller("MainController", MainController);

    /*
     * Main Controller
     */
    MainController.$inject = ["$scope"];
    function MainController($scope, $http) {
        
    };
})();
