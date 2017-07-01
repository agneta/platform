const cheerio = require('cheerio');

module.exports = function(Model) {

    Model.render = function(name, lng) {

        return Promise.resolve()
            .then(function() {
                return Model.__email.templates[name].render({
                    language: lng
                });
            })
            .then(function(result) {

                var $ = cheerio.load(result.html);
                var html = $.html(changeTag.call($('body'), $, 'div'));
                return {
                    name: name,
                    html: html
                };

            });

    };

    function changeTag($, tag) {
        var replacement = $('<' + tag + '>');
        replacement.attr(this[0].attribs);
        replacement.data(this.data());
        replacement.append(this.children());
        return replacement;
    }

    Model.remoteMethod(
        'render', {
            description: 'Render an email template',
            accepts: [{
                arg: 'name',
                type: 'string',
                required: true
            }, {
                arg: 'lng',
                type: 'string',
                required: true
            }],
            returns: {
                arg: 'result',
                type: 'object',
                root: true
            },
            http: {
                verb: 'post',
                path: '/render'
            }
        }
    );

};
