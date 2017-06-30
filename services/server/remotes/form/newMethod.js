var _ = require('lodash');
var ejs = require('ejs');
var Promise = require('bluebird');

module.exports = function(Model, app) {

    var formServices = Model.clientHelpers.get_data('form/services');

    Model.newMethod = function(formMethod) {

        var formFields = {};
        var form = Model.clientHelpers.get_data(formMethod.data);

        var accepts = [{
            arg: 'req',
            type: 'object',
            'http': {
                source: 'req'
            }
        }];

        function scanFields(data) {
            for (var field of data.fields) {

                field = Model.clientHelpers.form_field(field, formMethod);
                if (field.fields) {
                    scanFields(field);
                    continue;
                }

                if (!field.name) {
                    continue;
                }

                if (field.static) {
                    continue;
                }

                formFields[field.name] = field;

                var type = field.valueType || 'string';

                switch (field.type) {
                    case 'number':
                        type = 'number';
                        break;
                }

                accepts.push({
                    arg: field.name,
                    type: type,
                    required: field.validators && field.validators.required
                });
            }
        }

        scanFields(form);

        function method(args) {

            var req = args[0];
            var fields = {};

            _.map(args, function(value, index) {
                var map = accepts[index];

                if (!map) {
                    return;
                }
                var field = formFields[map.arg];

                if (!field || field.sendDisabled) {
                    return;
                }

                var title = field.title || field.name;
                var sourceValue = value;

                if (field.options) {

                    var option = _.find(field.options, {
                        value: value
                    });

                    if (option && option.title) {
                        value = app.lng(option.title, req);
                    }

                }

                field = {
                    name: map.arg,
                    title: title,
                    value: value,
                    sourceValue: sourceValue
                };

                fields[map.arg] = field;

            });

            return Promise.resolve({
                fields: fields,
                req: req,
                form: form
            });


        }
        return {
            fields: formFields,
            method: method,
            accepts: accepts
        };

    };
};
