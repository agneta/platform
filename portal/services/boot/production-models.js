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
const S = require('string');

module.exports = function(app) {

  var instructions = [];
  var appOptions = app.get('options');

  //--------------------------------------------------
  // Create the Production app

  var prdConfig = {};
  var appPrd = _.extend({}, app, {
    get: function(name) {
      return prdConfig[name] || app.get(name);
    },
    set: function(name, value) {
      prdConfig[name] = value;
    }
  });

  var appOptionsPrd = _.extend({}, appOptions, {
    env: 'production'
  });

  require(
    path.join(appOptions.web.project.paths.core.services, 'lib', 'locals')
  )(appPrd, appOptionsPrd);

  require(
    path.join(appOptions.web.project.paths.core.services, 'lib', 'secrets')
  )(appPrd, appOptionsPrd);


  //--------------------------------------------------
  // Create the Production data source

  var db_prd =  _.extend({
    connector: 'loopback-connector-mongodb'
  },
  appPrd.secrets.get('db'));
  app.dataSource('db_prd', db_prd);

  //--------------------------------------------------


  app.models().forEach(function (model) {

    var definition = app.modelSchemas[model.modelName];
    if(!definition){
      //console.warn(`Definition not found for model ${model.modelName}`);
      return;
    }
    //console.log(definition);
    definition = _.cloneDeep(definition);
    instructions.push({
      name: model.modelName,
      definition: definition,
      sourceName: model.modelName
    });

  });

  //--------------------------------------------------
  // Roles

  var rolesOriginal = app.get('roles');
  var roles = {};


  for (var key in rolesOriginal) {
    var role = _.extend({}, rolesOriginal[key]);
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

    var modelOptions = _.extend({},app.modelConfig[data.sourceName]);

    if(modelOptions.dataSource){
      modelOptions.dataSource += '_prd';
    }else{
      modelOptions.dataSource = false;
    }

    app.model(data.model,modelOptions);

  });

  app.roles.set(app.models.Production_Account, roles);

  //-----------------------------------------------------------------

  function productionName(name) {
    return 'Production_' + name;
  }

  function productionModel(data) {

    let name = data.name;
    let newName = productionName(name);
    let definition = data.definition;

    definition.name = newName;

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
      path: S(newName).slugify().s
    });

    // create a model

    data.model = app.registry.createModel(definition);
    data.model.__isProduction = true;
    data.model.app = appPrd;

    data.newName = newName;

  }

};
