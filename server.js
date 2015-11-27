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

var fs = require('fs'),
    configuration = require('./configuration.json');

var sivartApp = require('./app');

sivartApp.listen(configuration.sivart.serverPort);
console.log("sivart-ci started on port : ", configuration.sivart.serverPort);
