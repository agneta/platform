/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/models/api/model.js
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
const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(Model, app) {

  Model.model = function(name,project) {

    var modelApp = project?app.web.services:app;
    return Promise.resolve()
      .then(function(){

        var remotes = modelApp.remotes();
        var sharedClass = remotes._classes[name];
        var adapter = remotes.handler('rest').adapter;

        if(!sharedClass){
          return Promise.reject({
            statusCode: 401,
            message: `Could not find model with name ${name}`
          });
        }

        return getRoutes(adapter,sharedClass);

      })
      .then(function(list) {
        return {
          list: _.sortBy(list,['path']),
          schema: modelApp.modelSchemas[name]
        };
      });

  };

  function getRoutes(adapter, sc) {
    var routes = [];
    var currentRoot = '';

    adapter
      .getRoutes(sc)
      .forEach(function(classRoute) {
        currentRoot = classRoute.path;
        var methods = sc.methods();

        methods.forEach(function(method) {
          adapter.getRoutes(method).forEach(function(route) {
            if (method.isStatic) {
              addRoute(route.verb, route.path, method);
            } else {
              adapter
                .getRoutes(method.sharedCtor)
                .forEach(function(sharedCtorRoute) {
                  addRoute(route.verb, sharedCtorRoute.path + route.path, method);
                });
            }
          });
        });
      });

    return routes;

    function addRoute(verb, path, method) {
      if (path === '/' || path === '//') {
        path = currentRoot;
      } else {
        path = currentRoot + path;
      }

      if (path[path.length - 1] === '/') {
        path = path.substr(0, path.length - 1);
      }

      // TODO this could be cleaner
      path = path.replace(/\/\//g, '/');

      routes.push({
        verb: verb,
        path: path,
        description: method.description,
        notes: method.notes,
        documented: method.documented,
        method: method.stringName,
        accepts: (method.accepts && method.accepts.length) ? method.accepts : undefined,
        returns: (method.returns && method.returns.length) ? method.returns : undefined,
        errors: (method.errors && method.errors.length) ? method.errors : undefined,
      });
    }
  }

  Model.remoteMethod(
    'model',
    {
      description: 'Get API remote methods and schema from a specified model',
      accepts: [{
        arg: 'name',
        type: 'string',
        required: true
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
        path: '/model'
      },
    }
  );

};
