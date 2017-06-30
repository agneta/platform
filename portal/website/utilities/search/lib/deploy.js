const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(util, options) {

    var Keyword = util.locals.services.models[options.model.keyword];
    var Page = util.locals.services.models[options.model.source];

    return function(data) {

        util.log('Clearing existing search data...');

        function deployItems(pages, options) {
            options = options || {};

            var bar = util.progress(pages.length, {
                title: options.title || `Uploading keywords for ${pages.length} search items`
            });

            return Promise.map(pages, function(page) {
                return Page.add(page)
                    .then(function() {
                        bar.tick({
                            title: _.get(page, 'title.value')
                        });
                    });

            }, {
                concurrency: 5
            });

        }


        if (_.isArray(data)) {
            return deployItems(data);
        }

        return Promise.map(data.languages, function(language) {

            util.log('[' + language.key + ']: Uploading ' + language.pages.length + ' pages...');

            return deployItems(language.pages, {
                title: 'Uploading keywords for language: ' + language.key
            });
        }, {
            concurrency: 1
        });

    };
};
