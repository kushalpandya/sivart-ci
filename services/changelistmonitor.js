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
        socket.on('getchangelist', function(changeListName) {
            console.log('Data request for Changelist ', changeListName);
            io.emit('onchangelistupdate', 'Updated - ' + changeListName);
        });
    });

    return sivartAppHTTP;
};

module.exports = changelistMonitor;
