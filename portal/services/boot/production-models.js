const path = require('path');
const _ = require('lodash');
var fs = require('fs');

module.exports = function(app) {

    var webPrj = app.get('options').web.project;
    var configPath = path.join(webPrj.paths.api, 'config.production.js');
    var configPrd = require(configPath);
    var instructions = [];

    //--------------------------------------------------
    // Create a data source

    app.dataSource('db_prd', _.extend({
            connector: 'loopback-connector-mongodb'
        },
        configPrd.db));

    //--------------------------------------------------

    function addInstruction(name) {
        instructions.push({
            name: name
        });
    }

    //--------------------------------------------------

    addInstruction('Form');
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
            name: newName,

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
            path: 'production/' + name.toLowerCase()
        });

        // create a model

        data.model = app.registry.createModel(definition);
        data.newName = newName;

    }

};
