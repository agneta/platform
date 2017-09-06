/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/template.js
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
const fs = require('fs-extra');
const ejs = require('ejs');
const _ = require('lodash');
const path = require('path');

module.exports = function(locals) {

  var project = locals.project;

  _.templateSettings = {
    interpolate: /\$\{(.+?)\}/g
  };

  project.extend.helper.register('render', function(template) {
    if (!_.isString(template)) {
      return template;
    }
    return _.template(template)(this);

  });

  project.extend.helper.register('template', function(path_partial, data, cache) {

    var content;
    var memCache = locals.cache.templates;

    if (cache) {

      content = memCache.get(path_partial);

      if (content) {
        //console.log('serving cached:', path_partial);
        return content;
      }
    }

    var file_path = project.theme.getTemplateFile(path_partial + '.ejs');
    if (!file_path) {
      console.dir(path_partial);
      throw new Error('Could not find template: ' + path_partial);
    }

    content = fs.readFileSync(file_path, 'utf8');
    content = ejs.render.apply(this, [content,
      _.extend(this, data, {
        locals: data || {}
      })
    ]);

    if (cache) {
      memCache.set(path_partial, content);
      //console.log('cache', memCache.length, memCache.itemCount);
    }

    return content;
  });

  project.extend.helper.register('has_template', function(req) {
    var path_partial = path.join(project.paths.base, 'source', req + '.ejs');

    var res = this.is_file(path_partial);

    if (res) {
      return true;
    }

    path_partial = path.join(project.paths.baseTheme, 'source', req + '.ejs');

    return this.is_file(path_partial);

  });

};
