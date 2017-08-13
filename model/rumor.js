var db = require('../db/db');

var Rumor = db.model('Rumor', {
    nodeId: String,
    messageId: String,
    originator: String,
    text: String,
    seqNo: Number
});

module.exports = Rumor;