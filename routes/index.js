const express = require('express');
var router = express.Router();
const rn = require('random-number');
const spawn = require('threads').spawn;

var GossipNode = require('gossip-node');
var Message = require('../model/message');
var Relationship = require('../model/relationship');
var Rumor = require('../model/rumor');
var Want = require('../model/want');

var gen = rn.generator({
    min: 0
    , max: 1000
    , integer: true
});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/new/nodeId', function (req, res) {
    res.json(gen);
});

router.post('/messages/:nodeId/rumor', function (req, res) {
    var nodeId = req.params.nodeId;
});

router.post('/messages/:nodeId/want', function (req, res) {
    var nodeId = req.params.nodeId;
});

/**
 * Spawns a new Gossip node with the given id
 * @param nodeId the id for the node.
 */
var spawnNode = function (nodeId) {
    // Create global processes if it doesn't exist
    if (global.processes === undefined) {
        global.processes = {};
    }
    // Spawn a new node and run it
    var thread = spawn(GossipNode);
    thread.send({nodeId: nodeId});
    global.processes[nodeId] = thread;
};

router.post('/nodes/:nodeId', function (req, res) {
    var nodeId = req.params.nodeId;
    console.log("Creating node with Id" + nodeId);
    spawnNode(nodeId);
    res.status(200).end();
});

router.delete('/nodes/:nodeId', function (req, res) {
    var nodeId = req.params.nodeId;
    if (global.processes && global.processes[nodeId]) {
        var thread = global.processes[nodeId];
        thread.kill();
        res.status(200);
    }
    else {
        res.status(404).send(nodeId + " not found. Couldn't stop.")
    }
    res.end();
});

/**
 * Get peers for the given node
 */
router.get('/peers/:nodeId', function (req, res) {
    var nodeId = req.params.nodeId;
    Relationship.find({nodeId: nodeId}, function (err, result) {
        var peers = [];
        if (err) {
            res.status(400).send(nodeId + "is not a valid node, or there was an error.");
        }
        else if (result && result.length) {
            result.forEach(function (friend, index) {
                peers.push(friend);
            });
            res.json(peers);
        }
        else {
            res.json("{}");
        }
        res.end();
    });
});

module.exports = router;
