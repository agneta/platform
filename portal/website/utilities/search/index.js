var path = require('path');
var _ = require('lodash');
var Promise = require('bluebird');
var path = require('path');

const Keywords = require('./lib/keywords');

module.exports = function(util) {

    Keywords(util, {
        model: {
            keyword: 'Search_Keyword',
            source: 'Search_Page'
        },
        filename: function(options) {
            return 'keywords_' + options.language;
        },
        title: 'path'
    });

    var result;

    return {
        run: function() {

            return require('./lib/generate')(util);

        }
    };


};
