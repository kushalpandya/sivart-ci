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
var stringTemplate = require('string-template'),
    configuration = require('./configuration.json');

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
    indexRoutes = require('./routes/index'),
    changelistRoutes = require('./routes/changelist'),
    changelistMonitor = require('./services/changelistmonitor'),
    sivartApp;

/*
 * Intialize App Server.
 */
sivartApp = express();
mongoose.connect(stringTemplate('{protocol}://{dbUserName}:{dbPassword}@{dbURL}', configuration.modulus));

sivartApp.use(express.static(__dirname + configuration.sivart.publicDir));
sivartApp.use(morgan(configuration.morgan.logType));

sivartApp.use('/', indexRoutes);
sivartApp.use('/api', changelistRoutes);
sivartApp.changelistMonitor = changelistMonitor;

module.exports = sivartApp;
