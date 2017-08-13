var db = require('../db/db');

var Message = db.model('Message', {
    nodeId: String,
    friendId: String,
    messageId: String,
    seqNo: Number
});

module.exports  = Message;