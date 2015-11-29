/**
 * sivart-ci v0.1.0
 *
 * A simple interactive CI Dashboard built on MEAN stack.
 *
 * Author: Kushal Pandya <kushalspandya@gmail.com> (https://doublslash.com)
 * Date: 27 November, 2015
 *
 * Changelist REST Routes.
 */

var stringTemplate = require('string-template'),
    configuration = require('../configuration.json');

var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan');

var ChangelistModel = mongoose.model('ChangelistModel'),
    router;

router = express.Router();

router.use(bodyParser.urlencoded({ 'extended': 'true' }));
router.use(bodyParser.json());
router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
router.use(methodOverride());


// @GET
// Gets all Changelists available.
router.get('/changelists', function(req, res) {
    ChangelistModel.find(function(err, changelists) {
        if (err)
            res.send(err);

        req.app.set('changelists', changelists);
        res.json(changelists);
    });
});

// @GET
// Gets Changelist by ID.
router.get('/changelist/:changeListId', function(req, res) {
    ChangelistModel.findById(req.params.changeListId, function(err, changelist) {
        if (err)
            res.send(err);

        res.json(changelist);
    });
});

// @PUT
// Update Changelist by ID.
router.put('/changelist/:changeListId', function(req, res) {
    var updatedChangelist = req.body;

    ChangelistModel.findByIdAndUpdate(req.params.changeListId, updatedChangelist, function (err, changelist) {
        if (err)
            res.send(err);

        res.json({
            status: 1,
            id: changelist.id,
            changeListName: changelist.changeListName
        });
    });
});

// @POST
// Create a Changelist.
router.post('/changelist', function(req, res) {
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
router.delete('/changelist/:changeListId', function(req, res) {
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

module.exports = router;
