const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(app) {

    var config = app.get('search');
    var result = [];

    for (var name in config) {
        var options = config[name];

        var config_field = require('./model_field');
        var config_keyword = require('./model_keyword');
        var config_position = require('./model_position');

        // Field

        var model_field = config_field();
        model_field.name = options.models.field;
        model_field.relations.positions.model = options.models.position;

        // Keyword

        var model_keyword = config_keyword();
        model_keyword.name = options.models.keyword;
        model_keyword.relations.positions.model = options.models.position;

        // Position

        var model_position = config_position();
        model_position.name = options.models.position;
        model_position.relations.page.model = options.models.source;
        model_position.relations.keyword.model = options.models.keyword;
        model_position.relations.field.model = options.models.field;

        //-----------------------------------------

        result.push({
            model: model_field,
            config: {
                dataSource: 'db',
                public: false
            }
        });

        result.push({
            model: model_keyword,
            config: {
                dataSource: 'db',
                public: false
            }
        });

        result.push({
            model: model_position,
            config: {
                dataSource: 'db',
                public: false
            }
        });

    }

    return result;

};
