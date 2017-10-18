const simpleParser = require('mailparser').simpleParser;
const Promise = require('bluebird');

module.exports = function(){

  var list = {};

  function listener(result, incomingMessage, exchangeId) {

    var responseParsed = list[exchangeId];
    if (!responseParsed) {
      return;
    }

    delete list[exchangeId];

    if (!result) {
      return responseParsed.reject('No incoming response. Check the log for errors');
    }

    var resContentType = incomingMessage.headers['content-type'];
    var attachments = [];

    Promise.resolve()
      .then(function() {

        var buffer = Buffer.concat([
          Buffer.from('content-type: ' + resContentType + '\r\n', 'utf8'),
          incomingMessage.request.bufferResult
        ]);

        return simpleParser(buffer)
          .then(function(parsed) {
            attachments = parsed.attachments;
          });

      })
      .then(function() {

        responseParsed.resolve({
          attachments: attachments,
          raw: result
        });

      });

  }

  return {
    list: list,
    listener: listener
  };

};
