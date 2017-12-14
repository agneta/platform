/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/soap/request.js
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
const minimatch = require('minimatch');
const Request = require('request');
const concatStream = require('concat-stream');
const _ = require('lodash');

module.exports = function(app) {

  var overrideRules = app.get('wsdl').override || [];
  const soapSecurity = require('./security')(app);

  return function(options) {

    return function(requestOptions, cb) {

      soapSecurity({
        servicePath: options.servicePath,
        requestOptions: requestOptions
      })
        .then(function() {
          //console.log(options);
          //---------------------------------------------------
          //console.log('soap:request:requestOptions',requestOptions);
          for (var key in overrideRules) {

            var isMatch = minimatch(options.serviceFilePath, key);
            //console.log('soap:request:isMatch',options.serviceFilePath,key,isMatch);
            if (isMatch) {
              var rule = overrideRules[key];
              if (rule.endpoint) {

                var req = requestOptions.methodOptions.req;

                if (!req) {
                  return Promise.reject({
                    message: 'Expected req object to be present in methodOptions.'
                  });
                }

                //--------------------------------------------------------
                var checkKey = _.get(req.accessToken, rule.endpoint.key);

                if (!checkKey) {
                  return Promise.reject({
                    statusCode: 401,
                    message: 'Expected a rule key to be present in methodOptions.'
                  });
                }

                //--------------------------------------------------------

                var mapValue = rule.endpoint.map[checkKey];

                if (!mapValue) {
                  return Promise.reject({
                    statusCode: 401,
                    message: 'Expected the Map key to be present in endpoint override config.'
                  });
                }

                //--------------------------------------------------------

                var checkValue = rule.endpoint.value[mapValue];

                if (!checkValue) {
                  return Promise.reject({
                    statusCode: 401,
                    message: 'Expected the Value key to be present in endpoint override config.'
                  });
                }

                requestOptions.uri = _.template(requestOptions.uri.href, {
                  interpolate: /__:(.+?):__/g
                })(checkValue);
              }
            }

          }

          var request = Request(requestOptions, cb);
          request.on('response', function(response) {
            response.pipe(concatStream({
              encoding: 'buffer'
            }, function(buffer) {
              request.bufferResult = buffer;
            }));
          });


        })
        .catch(cb);
    };
  };
};
