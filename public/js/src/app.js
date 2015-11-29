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
    var sivartCI = angular.module('sivartCI', []),
        pageLocation = window.location,
        socketListenerPort = 3000,
        socket;

    /*
     * Declare App Controllers
     */
    sivartCI.controller("MainController", ["$scope", "$http", "$sce", '$timeout', MainController]);

    /*
     * Create Directives
     */
    sivartCI.directive('onFinishRender', ['$timeout', '$parse', function($timeout, $parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                if (scope.$last)
                {
                    scope.$eval(attrs.onFinishRender);
                }
            }
        };
    }]);

    /*
     * Main Controller
     */
    MainController.$inject = ["$scope"];
    function MainController($scope, $http, $sce, $timeout) {

        // Load Data
        $http.get('/api/changelists')
        .success(function(data) {
            $scope.changelistItems = data;
            $scope.changelistItems.findChangelist = function(fieldName, lookupValue) {
                var matchedChangelist,
                    i;

                for (i = 0; i < $scope.changelistItems.length; i++)
                {
                    if ($scope.changelistItems[i][fieldName] === lookupValue)
                    {
                        matchedChangelist = $scope.changelistItems[i];
                        break;
                    }
                }

                return matchedChangelist;
            };
        })
        .error(function(data) {
            console.log('Error Loading Changelists');
        });

        // Event Listeners
        $scope.onChangelistReady = function(val) {
            $timeout(function() {
                $scope.initSocket();
            }, 1);
        };

        $scope.onChangelistItemClick = function(changelistId) {
            var changelistEl = $('#' + changelistId),
                changelistDetailsEl = $('#' + changelistId + '-details').find('.changelist-details');

            if (changelistEl.hasClass('item-pass') ||
                changelistEl.hasClass('item-fail'))
            {
                if (!changelistDetailsEl.is(':visible'))
                {
                    changelistEl.addClass('expanded');
                    changelistEl.find('.changelist-status').attr('rowspan', 2);
                    changelistDetailsEl.slideDown('fast');
                }
                else
                {
                    changelistEl.removeClass('expanded');
                    changelistEl.find('.changelist-status').removeAttr('rowspan');
                    changelistDetailsEl.slideUp('fast');
                }
            }
        };

        // Item Preprocessors.
        $scope.getTimeStarted = function(timeStarted) {
            var timeStartedObj = new Date(timeStarted),
                formattedString;

            formattedString = timeStartedObj.getMonth() + '/' +
                              timeStartedObj.getDate() + '/' +
                              timeStartedObj.getUTCFullYear() + ' ' +
                              '<span class="glyphicon glyphicon-time"></span>' +
                              this.formatTime(timeStartedObj);

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
                    statusEl =  '<span class="short-message">' +
                                    '<span class="glyphicon glyphicon-remove-circle"></span>Failed' +
                                '</span>' +
                                '<span class="long-message">' +
                                    '<span class="glyphicon glyphicon-remove-circle"></span>Build Failure' +
                                '</span>';
                    break;
                case 0:
                    statusEl = '<span class="glyphicon glyphicon-option-horizontal"></span>Pending';
                    break;
                case 1:
                statusEl =  '<span class="short-message">' +
                                '<span class="glyphicon glyphicon-ok-circle"></span>Passed' +
                            '</span>' +
                            '<span class="long-message">' +
                                '<span class="glyphicon glyphicon-ok-circle"></span>Build Passed' +
                            '</span>';
                    break;
                default:
                    statusEl = '<span class="glyphicon glyphicon-refresh"></span>Running';
            }

            return $sce.trustAsHtml(statusEl);
        };

        $scope.getBuildStatus = function(status, timeCompleted) {
            var timeCompletedObj = new Date(timeCompleted),
                buildIconEl = status === 1 ? '<span class="glyphicon glyphicon-ok-sign"></span>' : '<span class="glyphicon glyphicon-remove-sign"></span>',
                buildStatusEl;

            buildStatusEl = '<span class="status-message">Build ' + buildIconEl + '</span>' +
                            '<span class="status-time">' +
                                '<span class="glyphicon glyphicon-time"></span>' +
                                this.formatTime(timeCompletedObj) +
                            '</span>';

            return $sce.trustAsHtml(buildStatusEl);
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

        // Utility Functions.
        $scope.formatTime = function(dateObj) {
            var hh = dateObj.getHours(),
                mm = dateObj.getMinutes(),
                ampm = hh >= 12 ? 'pm' : 'am';

            return hh + ':' + mm + ' ' + ampm;
        };

        $scope.initSocket = function() {
            var i;

            socket = io.connect(pageLocation.protocol + '//' + pageLocation.hostname + ':' + socketListenerPort);

            // Invokes build on Server.
            for (i = 1; i <=  $scope.changelistItems.length; i++)
            {
                $timeout(function(changelistId) {
                    socket.emit('triggerbuild', changelistId);
                }, i * 1000, true, $scope.changelistItems[i - 1]._id);
            }

            socket.on('buildstart', function(changelistId) {
                var changeListItemEl = $('tr#' + changelistId),
                    buildStepEl = $('tr#' + changelistId).find('.progress-steps .buildStep');
                console.log('Build started for Changelist ', $scope.changelistItems.findChangelist('_id', changelistId).changeListName);

                $scope.changelistItems.findChangelist('_id', changelistId).activity.status = 2;
                buildStepEl.removeClass('step-pending').addClass('step-active');
                buildStepEl.find('.step-icon').removeClass('step-icon-pending').addClass('step-icon-active');
            });

            socket.on('buildfinished', function(changelistId, status) {
                var changeListItemEl = $('tr#' + changelistId),
                    buildStepEl = changeListItemEl.find('.progress-steps .buildStep');
                console.log('Build finished for Changelist ', $scope.changelistItems.findChangelist('_id', changelistId).changeListName, ' with status ', status);

                if (status === 1)
                    buildStepEl.find('.step-icon').removeClass('step-icon-active').addClass('step-icon-pass');
                else
                {
                    $scope.changelistItems.findChangelist('_id', changelistId).activity.status = status;
                    buildStepEl.removeClass('step-active').addClass('step-fail');
                    buildStepEl.find('.step-icon').removeClass('step-icon-active').addClass('step-icon-fail');
                }
            });

            socket.on('unitteststart', function(changelistId) {
                var changeListItemEl = $('tr#' + changelistId),
                    buildStepEl = changeListItemEl.find('.progress-steps .buildStep'),
                    utStepEl = changeListItemEl.find('.progress-steps .utStep');

                console.log('Unit Tests started for Changelist ', $scope.changelistItems.findChangelist('_id', changelistId).changeListName);

                buildStepEl.addClass('fill-step-progress');
                $timeout(function() {
                    utStepEl.removeClass('step-empty').addClass('step-active');
                    utStepEl.find('.step-icon').addClass('step-icon-active');
                }, 1000);
            });

            socket.on('unittestfinished', function(changelistId, status) {
                var changeListItemEl = $('tr#' + changelistId),
                    buildStepEl = changeListItemEl.find('.progress-steps .buildStep'),
                    utStepEl = changeListItemEl.find('.progress-steps .utStep');

                if (status === 1)
                    utStepEl.find('.step-icon').removeClass('step-icon-active').addClass('step-icon-pass');
                else
                {
                    $scope.changelistItems.findChangelist('_id', changelistId).activity.status = status;
                    utStepEl.removeClass('step-active').addClass('step-fail');
                    buildStepEl.removeClass('step-active fill-step-progress').addClass('step-fail fill-step-progress');
                    $timeout(function() {
                        utStepEl.find('.step-icon').removeClass('step-icon-active').addClass('step-icon-fail');
                    }, 1000);
                }
            });

            socket.on('functionalteststart', function(changelistId) {
                var changeListItemEl = $('tr#' + changelistId),
                    buildStepEl = changeListItemEl.find('.progress-steps .buildStep'),
                    utStepEl = changeListItemEl.find('.progress-steps .utStep'),
                    ftStepEl = changeListItemEl.find('.progress-steps .ftStep');

                utStepEl.addClass('fill-step-progress');
                $timeout(function() {
                    ftStepEl.removeClass('step-empty').addClass('step-active');
                    ftStepEl.find('.step-icon').addClass('step-icon-active');
                }, 1000);
            });

            socket.on('functionaltestfinished', function(changelistId, status) {
                var changeListItemEl = $('tr#' + changelistId),
                    buildStepEl = changeListItemEl.find('.progress-steps .buildStep'),
                    utStepEl = changeListItemEl.find('.progress-steps .utStep'),
                    ftStepEl = changeListItemEl.find('.progress-steps .ftStep');

                if (status === 1)
                {
                    $scope.changelistItems.findChangelist('_id', changelistId).activity.status = status;
                    buildStepEl.removeClass('step-active fill-step-progress').addClass('step-pass fill-step-progress');
                    utStepEl.removeClass('step-active fill-step-progress').addClass('step-pass fill-step-progress');
                    ftStepEl.addClass('step-pass');
                    $timeout(function() {
                        ftStepEl.find('.step-icon').removeClass('step-icon-active').addClass('step-icon-pass');
                    }, 1000);
                }
                else
                {
                    $scope.changelistItems.findChangelist('_id', changelistId).activity.status = status;
                    buildStepEl.removeClass('step-active fill-step-progress').addClass('step-fail fill-step-progress');
                    utStepEl.removeClass('step-active fill-step-progress').addClass('step-fail fill-step-progress');
                    ftStepEl.addClass('step-fail');
                    $timeout(function() {
                        ftStepEl.find('.step-icon').removeClass('step-icon-active').addClass('step-icon-fail');
                    }, 1000);
                }
            });
        };
    }
})();
