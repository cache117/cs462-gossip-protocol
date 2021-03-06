const express = require('express');
var router = express.Router();
const rn = require('random-number');
const spawn = require('threads').spawn;

var GossipNode = require('../gossip-node');
var Relationship = require('../model/relationship');
var Rumor = require('../model/rumor');

var gen = rn.generator({
    min: 0
    , max: 1000
    , integer: true
});

var session;

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/new/nodeId', function (req, res) {
    session = req.session;
    var id = gen;
    console.log(id);
    res.json(id);
});

router.get('/test/setup', function (req, res) {
    var rumor = new Rumor({
        nodeId: '56489',
        messageId: '25zarc90-c123-12e4-8c91-7g52b91776f9',
        seqNo: 1,
        originator: 'george',
        text: 'Hello Zarc!'
    });
    rumor.save();
    rumor = new Rumor({
        nodeId: '56489',
        messageId: '10chef90-c123-12e4-8c91-7f41b91911f9',
        seqNo: 1,
        originator: 'sam',
        text: 'Hello Chef!'
    });
    rumor.save();
    rumor = new Rumor({
        nodeId: '56489',
        messageId: '37hose90-c123-12e4-8c91-4f41c91776f9',
        seqNo: 1,
        originator: 'martin',
        text: 'Hello Hose!'
    });
    rumor.save();
    rumor = new Rumor({
        nodeId: '56489',
        messageId: '36pott90-c123-12e4-8c91-6f6ku02864f9',
        seqNo: 1,
        originator: 'fred',
        text: 'Hello Pott!'
    });
    rumor.save();

    var peer
});

/**
 * Gets the rumors from a node for a specific message, greater than the given sequence number.
 * @param nodeId the node to get the rumors for.
 * @param messageId the message Id to get messages for.
 * @param seqNo the sequence number to look past. Gets messages with sequences greater than this.
 * @return {Promise} a promise from the database <code>exec()</code>
 */
function getRumors(nodeId, messageId, seqNo) {
    return Rumor.find({
        nodeId: nodeId,
        messageId: messageId,
        seqNo: {$gt: seqNo}
    }).sort({
        "seqNo": -1
    }).exec();
}

/**
 * find rumors that are listed as the given node, and whose originators are not themselves.
 * Also, sort by message id ascending and sequence number descending.
 *
 * @param nodeId the node to get the rumors for.
 * @return {Promise} a promise from the database <code>exec()</code>
 */
function getNodeRumors(nodeId) {
    return Rumor.find({
        nodeId: nodeId,
        originator: {$ne: nodeId}
    }).sort({
        "messageId": 1,
        "seqNo": -1
    }).exec();
}

/**
 * Gets rumors between the given nodes
 * @param first the first node.
 * @param second the second node.
 * @return {Promise} a promise from the database <code>exec()</code>
 */
function getRumorsBetweenRelationship(first, second) {
    return Rumor.find({
        nodeId: first,
        originator: second
    }).sort({
        "messageId": 1,
        "seqNo": -1
    }).exec();
}

router.get('/messages/rumor/:nodeId', function (req, res) {
    session = req.session;
    var nodeId = req.params.nodeId;
    console.log(nodeId);
    var messageId = req.params.messageId;
    var seqNo = req.params.seqNo;
    var originator = req.params.originator;
    console.log(nodeId);
    var databasePromise = null;
    if (messageId !== null && seqNo !== null) {
        databasePromise = getRumors(nodeId, messageId, seqNo);
    } else if (originator !== null) {
        databasePromise = getRumorsBetweenRelationship(nodeId, originator);
    } else {
        databasePromise = getNodeRumors(nodeId);
    }
    databasePromise
        .then(function (err, rumors) {
            if (!err) {
                res.json(rumors).end();
            }
            else {
                res.error("Failed to get rumor").end();
            }
        });
});

router.post('/messages/rumor/:nodeId', function (req, res) {
    session = req.session;
    var nodeId = req.params.nodeId;
    if (global.processes && global.processes[nodeId]) {
        var thread = global.processes[nodeId];
    }
});

router.get('/messages/want/:nodeId', function (req, res) {
    session = req.session;
    var nodeId = req.params.nodeId;

});

router.post('/messages/want/:nodeId', function (req, res) {
    session = req.session;
    var nodeId = req.params.nodeId;
    console.log(nodeId);
    if (global.processes && global.processes[nodeId]) {
        var thread = global.processes[nodeId];

    }
});

var getUrlForNode = function (req) {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
};

/**
 * Spawns a new Gossip node with the given id
 * @param nodeId the id for the node.
 * @param req the request. Used to the pass the url to the spawned node.
 */
var spawnNode = function (nodeId, req) {
    // Create global processes if it doesn't exist
    if (global.processes === undefined) {
        global.processes = {};
    }
    // Spawn a new node and run it
    var thread = spawn(GossipNode);
    thread.send({nodeId: nodeId, url: getUrlForNode(req)});
    global.processes[nodeId] = thread;
};

router.post('/nodes/:nodeId', function (req, res) {
    session = req.session;
    var nodeId = req.params.nodeId;
    console.log("Creating node with Id" + nodeId);
    spawnNode(nodeId, req);
    res.status(200).end();
});

router.delete('/nodes/:nodeId', function (req, res) {
    session = req.session;
    var nodeId = req.params.nodeId;
    console.log("Deleting node: " + nodeId);
    if (global.processes && global.processes[nodeId]) {
        var thread = global.processes[nodeId];
        thread.kill();
        delete global.processes[nodeId];
        res.status(200);
    }
    else {
        res.status(404).send(nodeId + " not found. Couldn't stop.");
    }
    res.end();
});

router.post('nodes/:nodeId/message', function (req, res) {
    session = req.session;
    var nodeId = req.params.nodeId;
    console.log("Sending message to node: " + nodeId);
    if (global.processes && global.processes[nodeId]) {
        var thread = global.processes[nodeId];

    } else {
        res.status(404).send(nodeId + " not found. Couldn't send message.");
    }
    res.end();
});

/**
 * Get peers for the given node
 */
router.get('/peers/:nodeId', function (req, res) {
    session = req.session;
    var nodeId = req.params.nodeId;
    console.log("Getting Peers for " + nodeId);
    Relationship.find({nodeId: nodeId}, function (err, result) {
        if (err) {
            res.status(400).send(nodeId + "is not a valid node, or there was an error.");
        }
        else if (result && result.length) {
            var peers = [];
            result.forEach(function (peer, index) {
                peers.push(peer);
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
