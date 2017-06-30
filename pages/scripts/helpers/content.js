var path = require('path');
var _ = require('lodash');

module.exports = function(locals) {

    var project = locals.project;

    project.extend.helper.register('contentAttr', function(data) {

        return `portal-edit="${data.__id}"`;

    });

};
