/**
 * sivart-ci v0.1.0
 *
 * A simple interactive CI Dashboard built on MEAN stack.
 *
 * Author: Kushal Pandya <kushalspandya@gmail.com> (https://doublslash.com)
 * Date: 28 November, 2015
 *
 * Sivart Changelist Monitor Socket.
 */

var stringTemplate = require('string-template'),
    configuration = require('../configuration.json');

var http = require('http'),
    socketIO = require('socket.io'),
    changelistMonitor;

changelistMonitor = function(sivartApp) {
    var sivartAppHTTP = http.Server(sivartApp),
        io = socketIO(sivartAppHTTP);

    io.on('connection', function(socket) {

        socket.on('triggerbuild', function(changelistId) {
            var changelists = sivartApp.get('changelists'),
                buildItemCount = 0;

            if (changelists &&
                changelists.length)
            {

                io.emit('buildstart', changelistId, (new Date()).getTime());

                changelists.forEach(function(changelistItem) {
                    buildItemCount++;

                    setTimeout(function(changelistId, buildItemCount) {
                        var utItemCount = 0;

                        changelistItem.build.timeCompleted = (new Date()).getTime();
                        io.emit('buildfinished',
                                    changelistId,
                                    buildItemCount === 2 ? -1 : 1,
                                    changelistItem.build.timeCompleted
                                );

                        if (buildItemCount !== 2)
                        {
                            io.emit('unitteststart', changelistId);
                            utItemCount++;
                            setTimeout(function(changelistId, utItemCount) {
                                var ftItemCount = 0;

                                changelistItem.build.timeCompleted = (new Date()).getTime();
                                changelistItem.unitTest.passCount = 276;
                                changelistItem.unitTest.duration = changelistItem.build.timeCompleted - changelistItem.timeStarted;
                                io.emit('unittestfinished',
                                            changelistId,
                                            buildItemCount === 3 ? -1 : 1,
                                            changelistItem.build.timeCompleted,
                                            changelistItem.unitTest.passCount
                                        );

                                if (buildItemCount !== 3)
                                {
                                    io.emit('functionalteststart', changelistId);
                                    ftItemCount++;
                                    setTimeout(function(changelistId, utItemCount) {
                                        changelistItem.build.timeCompleted = (new Date()).getTime();
                                        changelistItem.functionalTest.passCount = 13375;
                                        changelistItem.functionalTest.duration = changelistItem.build.timeCompleted - changelistItem.timeStarted;
                                        io.emit('functionaltestfinished',
                                                    changelistId,
                                                    buildItemCount === 4 ? -1 : 1,
                                                    changelistItem.build.timeCompleted,
                                                    changelistItem.functionalTest.passCount
                                                );
                                    }, ftItemCount * 5000, changelistId, buildItemCount);
                                }
                            }, utItemCount * 5000, changelistId, buildItemCount);
                        }
                    }, buildItemCount * 5000, changelistItem._id, buildItemCount);
                });
            }
        });
    });

    return sivartAppHTTP;
};

module.exports = changelistMonitor;
