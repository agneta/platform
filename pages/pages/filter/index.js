/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/filter/index.js
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

module.exports = function(ctx){
  var filter = ctx.extend.filter;

  require('./after_post_render')(ctx);
  require('./before_exit')(ctx);
  require('./template_locals')(ctx);

  filter.register('new_post_path', require('./new_post_path'));
  filter.register('post_permalink', require('./post_permalink'));
};
