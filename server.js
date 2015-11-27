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

/*
 * Load Configurations and Utilities.
 */
var fs = require('fs'),
    stringTemplate = require('string-template'),
    configuration = JSON.parse(fs.readFileSync('configuration.json')),
    sivartApp;

/*
 * Load Modules.
 */
var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan');

/*
 * Intialize App Server.
 */

sivartApp = express();

mongoose.connect(stringTemplate('{protocol}://{dbUserName}:{dbPassword}@{dbURL}', configuration.modulus));

sivartApp.use(express.static(__dirname + configuration.sivart.publicDir));
sivartApp.use(morgan(configuration.morgan.logType));
sivartApp.use(bodyParser.urlencoded({ 'extended': 'true' }));
sivartApp.use(bodyParser.json());
sivartApp.use(bodyParser.json({ type: 'application/vnd.api+json' }));
sivartApp.use(methodOverride());

sivartApp.listen(configuration.sivart.serverPort);
console.log("sivart-ci started on port : ", configuration.sivart.serverPort);
