/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/filter/after_post_render/excerpt.js
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

var rExcerpt = /<!-{2,} *more *-{2,}>/;

function excerptFilter(data){
  var content = data.content;

  if (rExcerpt.test(content)){
    data.content = content.replace(rExcerpt, function(match, index){
      data.excerpt = content.substring(0, index).trim();
      data.more = content.substring(index + match.length).trim();

      return '<a id="more"></a>';
    });
  } else {
    data.excerpt = '';
    data.more = content;
  }
}

module.exports = excerptFilter;