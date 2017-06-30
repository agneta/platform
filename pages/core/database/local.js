var fs = require('hexo-fs');
var Database = require('warehouse');
var registerModels = require('../../pages/register_models');
var path = require('path');
var _ = require('lodash');

module.exports = function(locals) {

    var project = locals.project;

    var db = project.database = new Database({
        version: 1,
        path: path.join(project.paths.base, 'db.json')
    });

    project.model = function(name, schema) {
        return db.model(name, schema);
    };

    registerModels(project);

    var Page = db.model('Page');

    ////////////////////////////////////////////////

    _.extend(project.site, {
        pages: {
            find: function(query, options) {
                query = query || {};
                query.isSource = true;
                return Page.find.call(Page, query,options);
            },
            map: function() {
                return Page.map.apply(Page, arguments);
            },
            findOne: function(query) {
                return Page.findOne.call(Page, query);
            },
            findById: function(id) {
                return Page.findById.call(Page, id);
            }
        }
    });

    _.extend(project.locals, project.site);
    _.extend(project.locals.cache, project.site);

}
