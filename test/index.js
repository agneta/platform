/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: test/index.js
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
const chai = require('chai');
const chaiHttp = require('chai-http');
const klaw = require('klaw');
const path = require('path');
const Promise = require('bluebird');

chai.should();
chai.use(chaiHttp);

it('Starting the server', function() {

  this.timeout(12000);

  return require('../main/index')
    .then(function(data) {
      var domain = 'http://localhost:' + data.port;

      var options = {
        domain: domain,
        agent: chai.request.agent(domain),
        account: data.result.portalSettings.account
      };

      var pathTests = path.join(__dirname, 'api');
      var walker = klaw(pathTests);

      walker.on('data', function(item) {

        if (item.stats.isDirectory()) {
          return;
        }

        var path_parsed = path.parse(item.path);

        switch (path_parsed.ext) {
          case '.js':
            require(item.path)(options);
            break;
        }

      });

      return new Promise(function(resolve, reject) {
        walker.on('end', resolve);
        walker.on('error', reject);
      });

    });
});
