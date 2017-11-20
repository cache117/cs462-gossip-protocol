var db = require('../db/db');

var Rumor = db.model('Rumor', {
    nodeId: String,
    messageId: String,
    seqNo: Number,
    originator: String,
    text: String
});

module.exports = Rumor;