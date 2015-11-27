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
    configuration = JSON.parse(fs.readFileSync('configuration.json'));

/*
 * Load Modules.
 */
var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan');

/*
 * Declare App Globals
 */
var sivartApp,
    changelistSchema,
    ChangelistModel,
    socket,
    http;

sivartApp = express();
http = require('http').Server(sivartApp);
socket = require('socket.io')(http);

/*
 * Intialize App Server.
 */

mongoose.connect(stringTemplate('{protocol}://{dbUserName}:{dbPassword}@{dbURL}', configuration.modulus));

sivartApp.use(express.static(__dirname + configuration.sivart.publicDir));
sivartApp.use(morgan(configuration.morgan.logType));
sivartApp.use(bodyParser.urlencoded({ 'extended': 'true' }));
sivartApp.use(bodyParser.json());
sivartApp.use(bodyParser.json({ type: 'application/vnd.api+json' }));
sivartApp.use(methodOverride());

/*
 * Start Server
 */
sivartApp.listen(configuration.sivart.serverPort);
console.log("sivart-ci started on port : ", configuration.sivart.serverPort);

/*
 * Create Models
 */
changelistSchema = new mongoose.Schema({
    changeListName: String,
    owner: String,
    timeStarted: Number,
    activity: {
        status: Number,
        phase: Number
    },
    build: {
        timeCompleted: Number
    },
    unitTest: {
        total: Number,
        passCount: Number,
        duration: Number
    },
    functionalTest: {
        total: Number,
        passCount: Number,
        duration: Number
    }
});

ChangelistModel = mongoose.model('ChangelistModel', changelistSchema);

/*
 * Create REST API.
 */

// @GET
// Gets all Changelists available.
sivartApp.get('/api/changelists', function(req, res) {
    ChangelistModel.find(function(err, changelists) {
        if (err)
            res.send(err);

        res.json(changelists);
    });
});

// @GET
// Gets Changelist by ID.
sivartApp.get('/api/changelist/:changeListId', function(req, res) {
    ChangelistModel.findById(req.params.changeListId, function(err, changelist) {
        if (err)
            res.send(err);

        res.json(changelist);
    });
});

// @POST
// Create a Changelist.
sivartApp.post('/api/changelist', function(req, res) {
    var newChangelist = req.body;

    ChangelistModel.create(newChangelist, function(err, changelist) {
        if (err)
            res.send(err);
        else
            console.log('Created Changelist with name ', changelist.changeListName);

        res.json({
            status: 1,
            id: changelist.id,
            changeListName: changelist.changeListName
        });
    });
});

// @DELETE
// Delete a Changelist by ID.
sivartApp.delete('/api/changelist/:changeListId', function(req, res) {
    var changeListId = {
        _id: req.params.changeListId
    };

    ChangelistModel.remove(changeListId, function(err, changelist) {
        if (err)
            res.send(err);
        else
            console.log('Changelist Deleted with ID ', changeListId._id);

        res.json({
            status: 1
        });
    });
});
