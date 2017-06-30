var _ = require('lodash');
var path = require('path');
var fs = require('fs-promise');
var yaml = require('js-yaml');
const Promise = require('bluebird');

module.exports = function(locals) {

    var project = locals.project;
    var services = locals.services;

    project.extend.generator.register('roles', function() {

        var roles = services.get('roles');
        var result = [];

        return Promise.map(_.keys(roles), function(key) {

            var role = roles[key];
            if (!role.form) {
                return;
            }

            var name = 'role-' + key;

            var pageData = _.extend({
                path: path.join('partial', name),
                template: 'role',
                barebones: true,
                controller: 'FormRole',
                scripts:[
                  'partial/role'
                ]
            }, role);

            pageData.form.name = 'formRole';

            result.push(pageData);
        })
        .then(function(){
            return result;
        });
    });

};
