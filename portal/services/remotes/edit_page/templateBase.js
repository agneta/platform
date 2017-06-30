var _ = require('lodash');

module.exports = function(template) {

    var fields = [{
            name: 'title',
            validators: {
                required: true
            },
            title: {
                en: 'Title',
                gr: 'Τίτλος'
            },
            type: 'text-single'
        },
        {
            name: 'description',
            validators: {
                required: true
            },
            title: {
                en: 'Description',
                gr: 'Περιγραφή'
            },
            type: 'text'
        }
    ];

    template.fields = [].concat(fields, template.fields);
};
