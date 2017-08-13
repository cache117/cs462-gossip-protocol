var db = require('../db/db');

var Relationship = db.model('Relationship', {
    nodeId: String,
    friendId: String
});

module.exports = Relationship;