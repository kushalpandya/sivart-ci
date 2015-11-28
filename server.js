/**
 * sivart-ci v0.1.0
 *
 * A simple interactive CI Dashboard built on MEAN stack.
 *
 * Author: Kushal Pandya <kushalspandya@gmail.com> (https://doublslash.com)
 * Date: 27 November, 2015
 *
 * Sivart Server Script.
 */

var configuration = require('./configuration.json');

var sivartApp = require('./app'),
    sivartSocketServer = sivartApp.changelistMonitor(sivartApp);

sivartApp.listen(configuration.sivart.httpPort);
sivartSocketServer.listen(configuration.sivart.socketPort, function() {
    console.log("sivart-ci socket server started on port : ", configuration.sivart.socketPort);
});
console.log("sivart-ci started on port : ", configuration.sivart.httpPort);
