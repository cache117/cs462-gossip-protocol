const uuid = require('uuid/v4');
var request = require('request');

function GossipNode(input, done) {
    var self = this;
    this.nodeId = input.nodeId;
    this.url = input.url;
    this.nodeUrl = input.url + "/node/" + self.nodeId;
    this.state = {};

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
     * <pre>
     *   {"Want": ["ABCD-1234-ABCD-1234-ABCD-125A": 3,
     *             "ABCD-1234-ABCD-1234-ABCD-129B": 5,
     *             "ABCD-1234-ABCD-1234-ABCD-123C": 10,
     *             ...
     *            ] ,
     *    "EndPoint": "https://example.com/gossip/asff3"
     *   }
     * </pre>
     * This expects <code>originIds</code> to be in the form:
     *  <pre>
     * [
     *      {
     *          "uuid": "ABCD-1234-ABCD-1234-ABCD-125A",
     *          "seqNo": 3
     *      },
     *      ...
     * ]
     * </pre>
     * @param {Object[]} originIds  an array of pairs
     * @param {string} originIds[].uuid the id of the pair.
     * @param {number} originIds[].seqNo the sequence number associated with the id.
     * @param endPoint URL of the node propagating the rumor.
     * @returns {{Want: Array, EndPoint: String}}
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

    function getRandomArrayIndex(length) {
        return Math.floor(Math.random() * (length - 1));
    }

    function getPeer(state, callback) {
        request.get(self.url + "peers/" + self.nodeId, function(err, res, body) {
            if (!err && body) {
                var peers = JSON.parse(body);
                var length = Object.keys(peers).length;
                if (length === 0) {
                    callback(null);
                } else if (length === 1) {
                    callback(peers[0]);
                } else {
                    return peers[getRandomArrayIndex(length)];
                }
            } else {
                callback(null);
            }
        });
    }

    function chooseToSendRumor(){
        return (Math.random() > 0.5);
    }

    function prepareMessage(state, peer) {
        if (chooseToSendRumor()) {
            self.generateRumorMessage(null, null, null, null);
        }
        else {
            self.generateWantMessage(null, null);
        }
    }

    function sendMessage(url, message) {
        request.post(
            url,
            {
                json: {
                    message: message
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    console.log(body)
                }
            }
        );
    }

    while (true) {
        setTimeout(function () {
            getPeer(self.state, function (peer) {
                if (peer !== null) {
                    var message = prepareMessage(self.state, peer);
                    var url = peer.nodeUrl;
                    sendMessage(url, message);
                }
            });
        }, 200);
    }
}

module.exports = GossipNode;