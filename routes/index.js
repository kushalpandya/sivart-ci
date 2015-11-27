/**
 * sivart-ci v0.1.0
 *
 * A simple interactive CI Dashboard built on MEAN stack.
 *
 * Author: Kushal Pandya <kushalspandya@gmail.com> (https://doublslash.com)
 * Date: 27 November, 2015
 *
 * Web Access Routes.
 */

var fs = require('fs'),
    stringTemplate = require('string-template'),
    configuration = require('../configuration.json');

var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override');

var router = express.Router();

router.use(bodyParser.urlencoded({ 'extended': 'true' }));
router.use(methodOverride());

router.route('/').get(function(req, res) {
    res.sendFile(configuration.sivart.publicDir + 'index.html');
});

module.exports = router;
