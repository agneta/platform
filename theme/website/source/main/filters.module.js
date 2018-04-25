/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/filters.module.js
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
var app = angular.module('MainApp');

app.filter('numkeys', function() {
  return function(object) {
    if(!object){
      return;
    }
    return Object.keys(object).length;
  };
});

app.filter('filesize', function() {

  return function(bytes) {

    return window.filesize(bytes);

  };

});


app.filter('highlight', function($sce) {
  return function(text, phrase) {
    if (!text) {
      return;
    }
    if (!phrase) {
      return text;
    }
    phrase = phrase.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[]\\\/]/gi, '');
    phrase = phrase.split(' ').join('|');
    text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
      '<span class="highlighted">$1</span>');
    return $sce.trustAsHtml(text);
  };
});

app.filter('highlight_fuse', function($sce) {

  var wrapStart = '<span class="highlighted">';
  var wrapEnd = '</span>';
  var wrapSize = wrapStart.length + wrapEnd.length;

  return function(text, matches, name) {

    if (!text) {
      return;
    }
    if (!matches || !matches.length) {
      return text;
    }

    for (var key in matches) {
      var match = matches[key];

      if (match.key != name) {
        continue;
      }

      var offset = 0;
      for (var keyIndices in match.indices) {
        var indice = match.indices[keyIndices];
        var start = indice[0] + offset;
        var end = indice[1] + offset + 1;
        text = text.substring(0, start) + wrapStart + text.substring(start, end) + wrapEnd + text.substring(end);
        offset += wrapSize;
      }
    }

    return $sce.trustAsHtml(text);
  };
});
