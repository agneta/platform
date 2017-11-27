/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/soap/response.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
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
