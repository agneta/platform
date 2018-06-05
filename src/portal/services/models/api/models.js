/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/api/models.js
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

const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function(Model, app) {

  Model.models = function(production,project) {

    var modelApp = project?app.web.services:app;
    var remotes = modelApp.remotes();
    var list = [];

    production = production?true:false;

    return Promise.resolve()
      .then(function() {

        return Promise.map(remotes.classes(), function(remoteClass) {
          var isProduction = remoteClass.ctor.__isProduction?true:false;
          //console.log(production,isProduction);
          if(production != isProduction){
            return;
          }
          list.push({
            name: remoteClass.name,
            http: remoteClass.http
          });
        });

      })
      .then(function(){
        return {
          list:  _.sortBy(list,['name'])
        };
      });

  };

  Model.remoteMethod(
    'models', {
      description: 'Get API models',
      accepts: [{
        arg: 'production',
        type: 'boolean'
      },{
        arg: 'project',
        type: 'boolean'
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/models'
      },
    }
  );

};
