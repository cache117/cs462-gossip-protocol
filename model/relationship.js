var db = require('../db/db');

var Relationship = db.model('Relationship', {
    nodeId: String,
    peerId: String
});

module.exports = Relationship;