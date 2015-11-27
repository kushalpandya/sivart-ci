/**
 * sivart-ci v0.1.0
 *
 * A simple interactive CI Dashboard built on MEAN stack.
 *
 * Author: Kushal Pandya <kushalspandya@gmail.com> (https://doublslash.com)
 * Date: 27 November, 2015
 *
 * Changelist Model.
 */

var mongoose = require('mongoose'),
    ChangelistModel,
    changelistSchema;

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

mongoose.model('ChangelistModel', changelistSchema);
