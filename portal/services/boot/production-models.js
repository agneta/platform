/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/production-models.js
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
const _ = require('lodash');

module.exports = function(app) {

  var instructions = [];
  var appOptions = app.get('options');
  var locals = require(
    path.join(appOptions.web.project.paths.services,'lib', 'locals')
  );

  //--------------------------------------------------
  // Create the Production app

  var prdConfig = {};
  var appPrd = _.extend({},app,{
    get: function(name){
      return prdConfig[name];
    },
    set: function(name,value){
      prdConfig[name] = value;
    }
  });

  locals(
    appPrd,
    _.extend({},appOptions,{
      env: 'production'
    })
  );

  //--------------------------------------------------
  // Create the Production data source

  var dbConfig = app.dataSources.db.settings;

  app.dataSource('db_prd', _.extend({
    connector: 'loopback-connector-mongodb'
  },
  dbConfig));

  //--------------------------------------------------

  function addInstruction(name) {
    instructions.push({
      name: name
    });
  }

  //--------------------------------------------------

  addInstruction('Form');
  addInstruction('Page');
  addInstruction('Account');
  addInstruction('Activity_Count');
  addInstruction('Activity_Feed');
  addInstruction('Activity_Item');

  //--------------------------------------------------
  // Roles

  var rolesOriginal = app.get('roles');
  var roles = {};


  for (var key in rolesOriginal) {
    var role = _.extend({}, rolesOriginal[key]);
    addInstruction(role.model);
    role.model = productionName(role.model);
    roles[key] = role;
  }

  app.set('roles_prd', roles);

  //-----------------------------------------------------------------
  // Run Instructions

  instructions.forEach(function(data) {
    productionModel(data);
  });

  app.helpers.runRemotes(instructions);

  instructions.forEach(function(data) {
    app.model(data.model, {
      dataSource: 'db_prd'
    });

  });

  app.helpers.setRoles(app.models.Production_Account, roles);

  //-----------------------------------------------------------------

  function productionName(name) {
    return 'Production_' + name;
  }

  function productionModel(data) {

    var name = data.name;
    var filename = name.toLowerCase();
    var newName = productionName(name);
    var definition = app.modelDefinitions[filename + '.json'].definition;

    definition = _.extend({}, definition, {
      name: newName
    });

    if (definition.relations) {
      for (var key in definition.relations) {
        var relation = definition.relations[key];
        relation.model = productionName(relation.model);
      }
    }

    definition.mongodb = definition.mongodb || {};
    definition.http = definition.http || {};

    _.extend(definition.mongodb, {
      collection: name
    });

    _.extend(definition.http, {
      path: newName
    });

    // create a model

    data.model = app.registry.createModel(definition);
    data.model.__isProduction = true;
    data.model.app = appPrd;

    data.newName = newName;

  }

};
