/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/soap-services.js
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
const path = require('path');
const Promise = require('bluebird');
const soap = require('soap');
const uuidV1 = require('uuid/v1');
const Request = require('request');
const concatStream = require('concat-stream');
const _ = require('lodash');
const klaw = require('klaw');
const S = require('string');

const SoapResponse = require('./soap/response');
const SoapSecurity = require('./soap/security');

module.exports = function(app) {

  const soapResponse = SoapResponse();
  const soapSecurity = SoapSecurity(app);

  app.soapServices = {};
  var config = app.get('wsdl');
  if (!config) {
    return;
  }

  var dirServices = config.path || path.join(app.get('services_dir'), 'wsdl');

  readDir(dirServices);

  //-----------------------------------------------------------

  function readDir(dirPath) {

    var walker = klaw(dirPath);

    walker.on('data', function(item) {

      if (item.stats.isDirectory()) {
        return;
      }

      onItem(item);

    });

    return new Promise(function(resolve, reject) {
      walker.on('end', resolve);
      walker.on('error', reject);
    });


    //-----------------------------------------------------------

    function onItem(item) {

      var file = item.path;

      var servicePath = path.relative(dirPath, file);
      servicePath = S(servicePath).replaceAll('/', '.').s;
      servicePath = path.parse(servicePath).name;

      return soap.createClientAsync(file, {
        wsdl_headers: {
          connection: 'keep-alive'
        },
        request: function(options, cb) {

          soapSecurity({
            servicePath: servicePath,
            requestOptions: options
          })
            .then(function() {

              //console.log(options);
              //---------------------------------------------------

              var request = Request(options,cb);

              request.on('response', function(response) {
                response.pipe(concatStream({
                  encoding: 'buffer'
                }, function(buffer) {
                  request.bufferResult = buffer;
                }));
              });


            })
            .catch(cb);

        }
      })
        .then(function(client) {

          var methodName = client.wsdl.definitions.$name;
          var method = client[methodName];
          var methodPromise = Promise.promisify(method);

          //------------------------------------------------------------------------

          client.on('soapError', function() {
            console.log(arguments);
          });

          client.on('response', soapResponse.listener);

          //------------------------------------------------------------------------

          var service = {
            getResult: function(query, options) {
              return methodPromise(query, {
                methodOptions: options
              });
            },
            getDetails: function(query, options) {

              return new Promise(function(resolve, reject) {

                var uuid = uuidV1();

                soapResponse.list[uuid] = {
                  resolve: resolve,
                  reject: reject
                };

                method(query, function(err) {
                  if (err) {
                    return reject(err);
                  }
                }, {
                  methodOptions: options,
                  exchangeId: uuid
                });
              });
            }
          };

          if (_.get(app.soapServices, servicePath)) {
            throw new Error('Conflict: Service path already exists.');
          }
          //console.log(servicePath);
          _.set(app.soapServices, servicePath, service);


        });
    }

  }






};
