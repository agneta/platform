/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/git/status.js
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
var Promise = require('bluebird');

module.exports = function(app) {

  app.git.status = function() {

    return app.git.addAll()
      .then(function() {
        return app.git.native.status();
      })
      .then(function(statuses) {
        //console.log(statuses);
        function statusToText(status) {
          var words = [];

          if (status.index=='A') {
            words.push({
              code: 'A',
              color: '#00b111',
              title: 'Added'
            });
          }

          if (status.index=='M') {
            words.push({
              code: 'M',
              color: '#9000b1',
              title: 'Modified'
            });
          }

          if (status.index=='R') {
            words.push({
              code: 'R',
              color: '#0065b1',
              title: 'Renamed'
            });
          }

          if (status.index=='!') {
            words.push({
              code: 'I',
              color: '#b16d00',
              title: 'Ignored'
            });
          }

          if (status.index=='C') {
            words.push({
              code: 'C',
              color: '#b16d00',
              title: 'Copied'
            });
          }

          if (status.index==' ') {
            words.push({
              code: ' ',
              color: '#b16d00',
              title: 'Unmodified'
            });
          }

          if (status.index=='D') {
            words.push({
              code: 'D',
              color: '#de2d00',
              title: 'Deleted'
            });
          }

          return words;
        }

        return Promise.map(statuses.files, function(file) {
          return {
            path: file.path,
            status: statusToText(file)
          };
        });

      });

  };

};
