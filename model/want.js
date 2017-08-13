var db = require('../db/db');

var Want = db.model('Want', {
    nodeId: String,
    messageId: String,
    originator: String,
    text: String,
    seqNo: Number
});

module.exports = Want;