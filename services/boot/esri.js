/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/esri.js
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
var urljoin = require('url-join');
var _ = require('lodash');
var requestPromise = require('request-promise');
var credentials = null;

module.exports = function(app) {

  var config = app.web.services.get('esri');

  if (!config) {
    return;
  }

  if(!credentials){
    credentials = app.secrets.get('esri');
  }

  var endpoint = urljoin(config.endpoint, 'rest/services', config.app, 'FeatureServer/0/query');
  var access;

  function generateToken() {

    return requestPromise.post({
      uri: 'https://www.arcgis.com/sharing/rest/generateToken',
      json: true,
      form: {
        username: credentials.username,
        password: credentials.password,
        f: 'json',
        referer: app.web.services.get('host')
      }
    })
      .then(function(res) {
        access = res;
        //console.log('Access token loaded');
      });

  }

  function query(query) {

    function esriQuery() {
      return requestPromise.get({
        uri: endpoint,
        json: true,
        qs: _.extend({
          inSr: 4326,
          outSr: 4326,
          f: 'json',
          token: access.token
        }, query)
      });
    }

    return esriQuery()
      .then(function(result) {
        if (result.error) {
          switch (result.error.code) {
            case 498:
            case 499:
              return generateToken()
                .then(esriQuery);
            default:
              throw result.error;
          }
        }
        return result;
      });
  }

  app.gis.esri = {
    query: query
  };

  return generateToken();

};
