/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/filter/template_locals/i18n.js
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
'use strict';

var util = require('hexo-util');
var Pattern = util.Pattern;
var _ = require('lodash');

function i18nLocalsFilter(locals){
  /* jshint validthis: true */
  var i18n = this.theme.i18n;
  var config = this.config;
  var i18nDir = config.i18n_dir;
  var page = locals.page;
  var lang = page.lang || page.language;
  var i18nLanguages = i18n.list();

  if (!lang){
    var pattern = new Pattern(i18nDir + '/*path');
    var data = pattern.match(locals.path);

    if (data && data.lang && ~i18nLanguages.indexOf(data.lang)){
      lang = data.lang;
      page.canonical_path = data.path;
    } else {
      lang = getFirstLanguage(config.language);
    }

    page.lang = lang;
  }

  page.canonical_path = page.canonical_path || locals.path;

  var languages = _([].concat(lang, i18nLanguages)).compact().uniq().value();

  locals.__ = i18n.__(languages);
  locals._p = i18n._p(languages);
}

module.exports = i18nLocalsFilter;

function getFirstLanguage(lang){
  if (Array.isArray(lang)){
    return lang[0];
  }

  return lang;
}