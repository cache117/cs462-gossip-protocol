const express = require('express');
var router = express.Router();

var Message = require('../model/message');
var Relationship = require('../model/relationship');
var Rumor = require('../model/rumor');
var Want = require('../model/want');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.post('/gossip/:nodeId', function (req, res) {
    var nodeId = req.params.nodeId;
});

router.get('/peers/:nodeId', function (req, res) {
    var nodeId = req.params.nodeId;
    Relationship.find({nodeId: nodeId}, function (err, result) {
        var friends = [];
        if (err) {
            res.status(400).send(nodeId + "is not a valid node, or it has no peers");
            res.end();
        }
        else if (result && result.length) {
            result.forEach(function (friend, index) {
                friends.push(friend);
            });

        }
        else {

        }
    })
});

module.exports = router;
