const _ = require('lodash');
const Promise = require('bluebird');
const S = require('string');
const GreekUtils = require('greek-utils');

module.exports = function(util, options) {

    var deploy = require('./deploy')(util, options);
    var json = require('./json')(util, options);

    var Keyword = util.locals.services.models[options.model.keyword];

    var keywordsLng = {};

    function scan(original, type) {

        if (!original) {
            return;
        }

        original = S(original)
            .collapseWhitespace()
            .stripTags()
            .trim()
            .s;

        //-------------------------------------------------------

        var processed = GreekUtils.sanitizeDiacritics(original);
        processed = processed.replace(/[^a-zA-Zα-ωΑ-Ω0-9]/g, ' ');
        var words = processed.split(' ');

        //-------------------------------------------------------

        if (
            type != 'title' &&
            // Need Sentences here instead of short phrases
            words.length < 4) {
            return;
        }

        //console.log('---------------------------------------------');
        //console.log(processed, original);
        //console.log(processed.length, original.length);
        //console.log('---------------------------------------------');

        var field = {
            value: original,
            type: type,
            positions: []
        };

        var position = 0;
        var index = 0;

        for (var word of words) {

            processWord(word);

            position += word.length;
            position++;

            index++;
        }

        function processWord(word) {

            if (!word) {
                return;
            }

            //-------------------------------------

            var keyword = GreekUtils.toGreeklish(word);

            keyword = S(keyword)
                .humanize()
                .latinise()
                .collapseWhitespace()
                .trim()
                .s
                .toLowerCase();

            //-------------------------------------

            if (!keyword ||
                keyword.length <= 2
            ) {
                return;

            }

            //-------------------------------------

            var originalWord = original.substr(position, word.length);

            field.positions.push({
                keyword: keyword,
                original: originalWord,
                value: position
            });

            //console.log(keyword, originalWord);

            //-------------------------------------

            keywordsLng[keyword] = keywordsLng[keyword] || true;

        }


        if (!field.positions.length) {
            return;
        }

        return field;

    }

    //-----------------------------------

    var Keywords = {
        scan: scan,
        dict: keywordsLng,
        deploy: deploy,
        json: json,
        clear: function() {
            return Keyword.clear()
                .then(function() {
                    util.success('Keywords cleared');
                });
        }
    };

    util.keywords = Keywords;

    return Keywords;

};
