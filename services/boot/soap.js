/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/soap.js
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
const _ = require('lodash');
const klaw = require('klaw');
const S = require('string');
const cheerio = require('cheerio');


const SoapResponse = require('./soap/response');

module.exports = function(app) {

  var config = app.get('wsdl');
  if (!config) {
    return;
  }

  const soapResponse = SoapResponse();
  const soapRequest = require('./soap/request')(app);

  app.soapServices = {};

  var dirServices = config.path || path.join(app.get('services_dir'), 'wsdl');

  readDir(dirServices);

  //-----------------------------------------------------------

  function readDir(dirPath) {

    var walker = klaw(dirPath);

    walker.on('data', function(item) {

      if (item.stats.isDirectory()) {
        return;
      }

      onItem(item)
        .catch(function(error){
          console.error(error);
          throw new Error(`Error on Item ${item.path}`);
        });

    });

    return new Promise(function(resolve, reject) {
      walker.on('end', resolve);
      walker.on('error', reject);
    });


    //-----------------------------------------------------------

    function onItem(item) {

      var file = item.path;

      var serviceFilePath = path.relative(dirPath, file);
      var servicePath = S(serviceFilePath).replaceAll('/', '.').s;
      servicePath = path.parse(servicePath).name;

      return soap.createClientAsync(file, {
        wsdl_headers: {
          connection: 'keep-alive'
        },
        request: soapRequest({
          servicePath: servicePath,
          serviceFilePath: serviceFilePath
        })
      })
        .then(function(client) {

          var methodName = client.wsdl.definitions.$name;
          var method = client[methodName];

          //------------------------------------------------------------------------

          client.on('response', soapResponse.listener);

          //------------------------------------------------------------------------

          function handleError(error){

            var errShow = _.get(error,'root.Envelope.Body.Fault.detail.SystemError');

            if(!errShow){
              errShow = error.Fault;
            }

            if(!errShow){
              errShow = error;
            }

            var result = _.extend(new Error(),{
              statusCode: 500,
              message: errShow.message||'Soap Server Error',
            },errShow);

            if(result.faultstring == 'Invalid XML'){
              var $ = cheerio.load(error.response.body,{decodeEntities: true});
              var contents = $('body').text();
              contents = S(contents).collapseWhitespace().s;
              result.contents = contents;
            }

            return result;
          }

          var service = {
            getResult: function(query, options) {
              return new Promise(function(resolve, reject) {

                query = _.pickBy(query, _.identity);
                //console.log(query);

                method(query, function(error,result) {

                  if (error) {
                    return reject(handleError(error));
                  }
                  return resolve(result);

                }, {
                  methodOptions: options
                });

              });
            },
            getDetails: function(query, options) {

              return new Promise(function(resolve, reject) {

                var uuid = uuidV1();

                soapResponse.list[uuid] = {
                  resolve: resolve,
                  reject: reject
                };

                method(query, function(error) {
                  if (error) {
                    return reject(handleError(error));
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
