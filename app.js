/**
 * sivart-ci v0.1.0
 *
 * A simple interactive CI Dashboard built on MEAN stack.
 *
 * Author: Kushal Pandya <kushalspandya@gmail.com> (https://doublslash.com)
 * Date: 27 November, 2015
 *
 * Sivart App Main Script.
 */

/*
 * Load Configurations and Utilities.
 */
var fs = require('fs'),
    stringTemplate = require('string-template'),
    configuration = JSON.parse(fs.readFileSync('configuration.json'));

/*
 * Load Modules.
 */
var express = require('express'),
    mongoose = require('mongoose'),
    morgan = require('morgan');

/*
 * Init App Modules
 */
var changelistModel = require('./model/changelist'),
    changelistRoutes = require('./routes/changelist'),
    sivartApp;

/*
 * Intialize App Server.
 */
sivartApp = express();
mongoose.connect(stringTemplate('{protocol}://{dbUserName}:{dbPassword}@{dbURL}', configuration.modulus));

sivartApp.use(express.static(__dirname + configuration.sivart.publicDir));
sivartApp.use(morgan(configuration.morgan.logType));

sivartApp.use('/api', changelistRoutes);

module.exports = sivartApp;
