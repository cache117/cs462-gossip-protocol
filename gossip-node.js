const uuid = require('uuid/v4');

function GossipNode(input, done) {
    this.nodeId = input.nodeId;
    var self = this;

    this.generateUuid = function () {
        return uuid();
    };

    this.generateNewUniqueId = function () {
        return self.generateUuid() + ":" + 1;
    };

    /**
     * Generates a rumor message which contains the text of the user message to be gossiped.
     * @param messageId a string containing the unique ID for this message.
     * @param originator a string giving the name of the server (or user).
     * @param text a string containing the actual message.
     * @param endPoint URL of the node propagating the rumor.
     * @returns {{Rumor: {MessageID: *, Originator: *, Text: *}, EndPoint: *}}
     */
    this.generateRumorMessage = function (messageId, originator, text, endPoint) {
        return {
            "Rumor": {
                "MessageID": messageId,
                "Originator": originator,
                "Text": text
            },
            "EndPoint": endPoint
        };
    };

    /**
     * Generates a Want message with the form:
     *
     *   {"Want": ["ABCD-1234-ABCD-1234-ABCD-125A": 3,
     *             "ABCD-1234-ABCD-1234-ABCD-129B": 5,
     *             "ABCD-1234-ABCD-1234-ABCD-123C": 10,
     *             ...
     *            ] ,
     *    "EndPoint": "https://example.com/gossip/asff3"
     *   }
     * @param {Object[]} originIds  an array of pairs, of the form.
     * @param {string} originIds[].uuid the id of the pair.
     * @param {string} originIds[].seqNo the sequence number associated with the id.
     * @param endPoint URL of the node propagating the rumor.
     * @returns {{Want: Array, EndPoint: *}}
     */
    this.generateWantMessage = function (originIds, endPoint) {
        var wantMessage = {
            "Want": [],
            "EndPoint": endPoint
        };
        for (var i = 0; i < originIds.length; ++i) {
            wantMessage.Want[originIds[i].uuid] = originIds[i].seqNo;
        }
        return wantMessage;
    };
}

module.exports = GossipNode;