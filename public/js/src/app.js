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

        $scope.onShowMenu = function() {
            $("#wrapper").toggleClass("toggled");
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

                    changelistDetailsEl.find('.css-pie').each(function(e) {
                    	var p = $(this).text();
                    	$(this)[0].style.animationDelay = '-' + parseFloat(p) + 's';
                    });
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

        $scope.getBuildDirectories = function(status) {
            var releaseDirEl,
                buildDirEl =    '<span class="directory-build">' +
                                    '<span class="glyphicon glyphicon-folder-close"></span>' +
                                    '<a href="#">debug</a>' +
                                '</span>';

            if (status > 0)
            {
                releaseDirEl = '<span class="directory-release">' +
                                    '<span class="glyphicon glyphicon-folder-close"></span>' +
                                    '<a href="#">release</a>' +
                                '</span>';
            }
            else
            {
                releaseDirEl = '<span class="directory-release">' +
                                    '<span class="glyphicon glyphicon-folder-open"></span>' +
                                    '<a href="#">release</a>' +
                                    '<a href="#"><span class="glyphicon glyphicon-save"></span>get logs</a>' +
                                '</span>';
            }

            return $sce.trustAsHtml(buildDirEl + releaseDirEl);
        };

        $scope.getTestBuildStatus = function(activity, tests, testType) {
            var testName = testType === 'ut' ? 'Unit Test' : 'Functional Test',
                targetPhase = testType === 'ut' ? 2 : 3,
                buildMetaEl = '',
                buildChartEl = '',
                buildChartLegendEl = '',
                testScore;

            if (activity.status > 0)
            {
                if (activity.phase > (targetPhase - 1))
                {
                    testScore = Math.round(tests.passCount / tests.total * 100) + '%';

                    buildMetaEl = '<span class="test-meta">' +
                                        '<span class="test-status">' +
                                            testName +
                                            '<span class="glyphicon glyphicon-ok-sign"></span>' +
                                        '</span>' +
                                        '<span class="test-score">' +
                                            testScore +
                                        '</span>' +
                                    '</span>';

                    buildChartEl = '<div class="css-pie">' + testScore + '</div>';

                    buildChartLegendEl = '<ul class="chart-legend">' +
                                            '<li class="total-tests">' + tests.total + '</li>' +
                                            '<li class="failed-tests">' + (tests.total - tests.passCount) + '</li>' +
                                            '<li class="test-duration glyphicon glyphicon-time">' + this.getDuration(tests.duration) + '</li>' +
                                         '</ul>';
                }
            }
            else
            {
                buildMetaEl = '<span class="test-meta">' +
                                    '<span class="test-status">' +
                                        testName +
                                        '<span class="glyphicon glyphicon glyphicon-remove-sign"></span>' +
                                    '</span>' +
                                    '<span class="test-score">0%</span>'+
                                    '<span class="test-reason">' +
                                        'Status: <span class="cause-message">Can\'t Run</span>' +
                                    '</span>' +
                                '</span>';
            }

            return $sce.trustAsHtml(buildMetaEl + buildChartEl + buildChartLegendEl);
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

        $scope.getDuration = function(milliseconds) {
            var sec = Math.round((milliseconds / 1000) % 60),
                min = Math.round((milliseconds / (1000 * 60)) % 60),
                hours = Math.round((milliseconds / (1000 * 60 * 60)) % 24);

            return hours + ':' + min + ':' + sec;
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

            socket.on('buildstart', function(changelistId, timeStarted) {
                var changeListItemEl = $('tr#' + changelistId),
                    changeListProgressEl = changeListItemEl.find('.stepbar-progress'),
                    changeListItem;

                console.log('Build started for Changelist ', $scope.changelistItems.findChangelist('_id', changelistId).changeListName);

                changeListItem = $scope.changelistItems.findChangelist('_id', changelistId);
                changeListItem.timeStarted = timeStarted;
                changeListItem.activity.status = 2;
                $scope.$apply();
                changeListProgressEl.attr('data-current-step', 1);
                changeListProgressEl.attr('data-step-status', 'active');
            });

            socket.on('buildfinished', function(changelistId, status, timeCompleted) {
                var changeListItemEl = $('tr#' + changelistId),
                    changeListProgressEl = changeListItemEl.find('.stepbar-progress'),
                    changeListItem;

                console.log('Build finished for Changelist ', $scope.changelistItems.findChangelist('_id', changelistId).changeListName, ' with status ', status);

                changeListItem = $scope.changelistItems.findChangelist('_id', changelistId);
                changeListItem.activity.phase = 1;
                changeListItem.build.timeCompleted = timeCompleted;

                if (status === 1)
                {
                    changeListProgressEl.attr('data-current-step', 1);
                    changeListProgressEl.attr('data-step-status', 'pass');
                }
                else
                {
                    changeListItem.activity.status = status;
                    $scope.$apply();
                    changeListProgressEl.attr('data-current-step', 1);
                    changeListProgressEl.attr('data-step-status', 'fail');
                }
            });

            socket.on('unitteststart', function(changelistId) {
                var changeListItemEl = $('tr#' + changelistId),
                    changeListProgressEl = changeListItemEl.find('.stepbar-progress');

                console.log('Unit Tests started for Changelist ', $scope.changelistItems.findChangelist('_id', changelistId).changeListName);

                changeListProgressEl.attr('data-current-step', 2);
                changeListProgressEl.attr('data-step-status', 'active');
            });

            socket.on('unittestfinished', function(changelistId, status, timeCompleted, passCount) {
                var changeListItemEl = $('tr#' + changelistId),
                    changeListProgressEl = changeListItemEl.find('.stepbar-progress'),
                    changeListItem;

                changeListItem = $scope.changelistItems.findChangelist('_id', changelistId);
                changeListItem.activity.phase = 2;
                changeListItem.unitTest.duration = timeCompleted - changeListItem.timeStarted;
                changeListItem.unitTest.passCount = passCount;
                changeListItem.build.timeCompleted = timeCompleted;

                if (status === 1)
                {
                    changeListProgressEl.attr('data-current-step', 2);
                    changeListProgressEl.attr('data-step-status', 'pass');
                }
                else
                {
                    changeListItem.activity.status = status;
                    $scope.$apply();
                    changeListProgressEl.attr('data-current-step', 2);
                    changeListProgressEl.attr('data-step-status', 'fail');
                }
            });

            socket.on('functionalteststart', function(changelistId) {
                var changeListItemEl = $('tr#' + changelistId),
                    changeListProgressEl = changeListItemEl.find('.stepbar-progress');

                changeListProgressEl.attr('data-current-step', 3);
                changeListProgressEl.attr('data-step-status', 'active');
            });

            socket.on('functionaltestfinished', function(changelistId, status, timeCompleted, passCount) {
                var changeListItemEl = $('tr#' + changelistId),
                    changeListProgressEl = changeListItemEl.find('.stepbar-progress'),
                    changeListItem;

                changeListItem = $scope.changelistItems.findChangelist('_id', changelistId);
                changeListItem.activity.status = status;
                $scope.$apply();
                changeListItem.activity.phase = 3;
                changeListItem.functionalTest.duration = timeCompleted - changeListItem.timeStarted;
                changeListItem.functionalTest.passCount = passCount;
                changeListItem.build.timeCompleted = timeCompleted;

                if (status === 1)
                {
                    changeListProgressEl.attr('data-current-step', 3);
                    changeListProgressEl.attr('data-step-status', 'pass');
                }
                else
                {
                    changeListProgressEl.attr('data-current-step', 3);
                    changeListProgressEl.attr('data-step-status', 'fail');
                }
            });
        };
    }
})();
