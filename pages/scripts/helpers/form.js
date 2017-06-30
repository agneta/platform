var _ = require('lodash');

module.exports = function(locals) {

    var project = locals.project;

    project.extend.helper.register('form_field', function(fieldProp, form) {

        var self = this;

        function getPreset(name) {
            var preset = self.get_data('form/fields/' + name);
            return _.extend({}, preset);
        }

        //

        var fieldName = null;
        var field = null;

        if (typeof fieldProp === 'string') {
            fieldName = fieldProp;
            field = getPreset(fieldProp);
        } else {
            field = _.extend({}, fieldProp);
        }

        if (field.base) {

            var preset = getPreset(field.base);
            field = _.deepMerge(
                field,
                preset
            );
            if (!field.name) {
                field.name = fieldName || field.base;
            }
        }

        this.field_props(form, field, fieldName);

        return field;

    });

    project.extend.helper.register('field_props', function(form, field, fieldName) {


        if (form.parent) {
            field.parent = form.parent;
        } else if (form.name) {
            field.parent = form.name + 'Fields';
        }

        if (form.parentForm) {
            field.parentForm = form.parentForm;
        } else if (form.name) {
            field.parentForm = form.name;
        }

        field.name = field.name || fieldName;

        if (field.name) {

            if (field.parent) {
                field.model = field.parent + '.' + field.name;
            } else {
                field.model = field.name;
            }

            if (form.parentForm) {
                field.modelForm = form.parentForm + '.' + field.name;
            } else if (form.name) {
                field.modelForm = form.name + '.' + field.name;
            } else {
                field.modelForm = field.name;
            }

            field.prop = field.modelForm;
        } else {
            field.name = form.name || form.parent;
        }
    });

    project.extend.helper.register('formValidators', function(field) {

        var validators = "";
        var messages = this.get_data('form/messages');

        for (var name in field.validators) {

            var value = field.validators[name];

            if (value === false) {
                continue;
            }

            switch (name) {
                case 'pattern':
                    name = "ng-pattern";
                    value = '/' + messages[value].pattern + '/';
                    break;
                case 'compareTo':
                    name = "compare-to";
                    value = field.parent + '.' + value;
                    break;
            }

            validators += name;
            if (value) {
                validators += '="' + value + '"';
            }
            validators += ' ';
        }

        return validators;

    });


};
