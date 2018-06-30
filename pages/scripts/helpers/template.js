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

_.templateSettings.escape = null;
_.templateSettings.evaluate = null;

module.exports = function(locals) {

  var project = locals.project;

  project.extend.helper.register('render', function(template,data) {
    if (!_.isString(template)) {
      return template;
    }

    if(data){
      data = _.extend({},data,this);
    }else{
      data = this;
    }

    return _.template(template,{
      interpolate: /\$\{(.+?)\}/g
    })(data);

  });

  project.extend.helper.register('template', function(path_partial, data, cache) {

    var content;
    var memCache = locals.cache.templates;
    var self = this;

    if (cache) {

      content = memCache.get(path_partial);

      if (content) {
        //console.log('serving cached:', path_partial);
        return content;
      }
    }

    if(path_partial[0]=='.'&&self.__path){
      /*
      let filePath = project.theme.getSourceFile(
        path.join(self.__path,path_partial)+ '.ejs'
      );
      let stats = fs.existsSync(filePath) && fs.statSync(filePath);
      let base;
      console.log(filePath);
      if(stats && stats.isDirectory()){
        base = self.__path;
      }else{
        base = path.parse(self.__path).dir;
      }*/
      path_partial = path.join(self.__path,path_partial);
    }

    self.__path = path_partial;

    var file_path = project.theme.getSourceFile(path_partial + '.ejs');

    if (!file_path) {
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

    (function(){

      var page = self.page;
      if(!page){
        return;
      }

      var commonData = self.__commonData || locals.page.commonData(page);

      var templateStyle = self.layout_style(path_partial);
      if (templateStyle) {
        commonData.styles.push(templateStyle);
      }

      var templateScript = self.layout_script(path_partial);
      if (templateScript) {
        commonData.scripts.push(templateScript);
      }

      commonData.scripts = _.uniq(commonData.scripts);
      commonData.styles = _.uniq(commonData.styles);

      if(!self.__commonData){
        self.__commonData = commonData;
      }

    })();


    return content;
  });

  project.extend.helper.register('has_template', function(req) {
    var path_partial = path.join(project.paths.app.source, req + '.ejs');

    var res = this.is_file(path_partial);

    if (res) {
      return true;
    }

    path_partial = path.join(project.paths.app.theme.source, req + '.ejs');

    return this.is_file(path_partial);

  });

};
