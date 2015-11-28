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
    sivartCI.controller("MainController", ["$scope", "$http", "$sce", MainController]);

    /*
     * Main Controller
     */
    MainController.$inject = ["$scope"];
    function MainController($scope, $http, $sce) {

        // Load Data
        $http.get('/api/changelists')
        .success(function(data) {
            $scope.changelistItems = data;
        })
        .error(function(data) {
            console.log('Error Loading Changelists');
        });

        // Item Preprocessors.
        $scope.getTimeStarted = function(timeStarted) {
            var timeStartedObj = new Date(timeStarted),
                hh = timeStartedObj.getHours(),
                mm = timeStartedObj.getMinutes(),
                ampm = hh >= 12 ? 'pm' : 'am',
                formattedString;

            hh = hh % 12;
            hh = hh ? hh : 12;
            mm = mm < 10 ? '0' + mm : mm;

            formattedString = timeStartedObj.getMonth() + '/' +
                              timeStartedObj.getDate() + '/' +
                              timeStartedObj.getUTCFullYear() + ' ' +
                              '<span class="glyphicon glyphicon-time"></span>' +
                              hh + ':' + mm + ' ' + ampm;

            return $sce.trustAsHtml(formattedString);
        };

        $scope.getStatus = function(status) {
            var statusEl = {
                "-1": "Failed",
                "0": "Pending",
                "1": "Passed",
                "2": "Running"
            };

            switch (status) {
                case -1:
                    statusEl = '<span class="glyphicon glyphicon-remove-circle"></span>Failed';
                    break;
                case 0:
                    statusEl = '<span class="glyphicon glyphicon-option-horizontal"></span>Pending';
                    break;
                case 1:
                    statusEl = '<span class="glyphicon glyphicon-ok-circle"></span>Passed';
                    break;
                default:
                    statusEl = '<span class="glyphicon glyphicon-refresh"></span>Running';
            }

            return $sce.trustAsHtml(statusEl);
        };

        $scope.getInitialStatusClass = function(status) {
            var statusMap = {
                "-1": "item-fail",
                "0": "item-pending",
                "1": "item-pass",
                "2": "item-active"
            };

            return statusMap[status];
        };
    }
})();
