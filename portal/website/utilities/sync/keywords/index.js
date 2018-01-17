/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/sync/keywords/index.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
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

    for (var word of words) {

      processWord(word);

      position += word.length;
      position++;
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
