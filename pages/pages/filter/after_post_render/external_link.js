/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/filter/after_post_render/external_link.js
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

var url = require('url');
var cheerio;

function externalLinkFilter(data){
  /* jshint validthis: true */
  var config = this.config;
  if (!config.external_link) return;

  if (!cheerio) cheerio = require('cheerio');

  var $ = cheerio.load(data.content, {decodeEntities: false});
  var siteHost = url.parse(config.url).hostname || config.url;

  $('a').each(function(){
    // Exit if the link has target attribute
    if ($(this).attr('target')) return;

    // Exit if the href attribute doesn't exists
    var href = $(this).attr('href');
    if (!href) return;

    var data = url.parse(href);

    // Exit if the link doesn't have protocol, which means it's a internal link
    if (!data.protocol) return;

    // Exit if the url has same host with config.url
    if (data.hostname === siteHost) return;

    $(this)
      .attr('target', '_blank')
      .attr('rel', 'external');
  });

  data.content = $.html();
}

module.exports = externalLinkFilter;