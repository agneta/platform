const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(options){

  var formFields = options.formFields;
  var accepts = options.accepts;
  var app = options.app;
  var form = options.form;

  return function(args) {

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

    var values = _.mapValues(fields, 'value');

    var shared = {
      app: app,
      fields: fields,
      form: form,
      req: req
    };

    return Promise.resolve({
      fields: fields,
      values: values,
      req: req,
      form: form,
      email: require('./email')(shared)
    });


  };
};
