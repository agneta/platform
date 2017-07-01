const Promise = require('bluebird');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const _ = require('lodash');

module.exports = function(options) {

    var web = options.app.get('options').web;
    var webPrj = web.project;
    var webHelpers = web.app.locals;

    return fs.readFile(options.path)
        .then(function(content) {

            template = yaml.safeLoad(content);

            function scan(collection) {

                for (var key in collection) {
                    var field = collection[key];

                    if (_.isString(field)) {
                        var name = field;
                        field = getField(field);
                        field.name = name;
                        collection[key] = field;
                    }

                    if (_.isObject(field)) {
                        if (field.extend) {
                            _.defaults(field, getField(field.extend));
                            field.name = field.extend;
                            delete field.extend;
                        }
                    }

                    if (field.fields) {
                        scan(field.fields);
                    }
                }
            }

            function getField(field) {
                return webHelpers.get_data('edit/fields/' + field);
            }

            scan(template.fields);
            template.title = options.app.lng(template.title, options.req);
            return template;

        });

};
