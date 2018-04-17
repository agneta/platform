/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/language.js
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
var ejs = require('ejs');
var _ = require('lodash');

module.exports = function(locals) {

  var project = locals.project;

  /////////////////////////////////////////////////////////////////
  // GET LANGUAGE
  /////////////////////////////////////////////////////////////////

  project.extend.helper.register('lng', function(obj, lang) {

    if(!obj){
      return;
    }

    var strict;
    var templateData;

    if(obj.source){
      var options = obj;
      obj = options.source;
      lang = options.lang;
      strict = options.strict;
      templateData = options.templateData;
    }

    var res;

    lang = lang || project.site.lang;

    if (_.isObject(obj)) {
      obj = obj.__value || obj;
    }

    if (_.isString(obj)) {

      var objPath = obj.split('.');
      var lngName = objPath[0];

      objPath.shift();
      objPath = objPath.join('.');

      var dataPath = 'lng/' + lngName;
      var dataResult;

      if (this.has_data(dataPath)) {
        var data = this.get_data(dataPath);
        dataResult = _.get(data, objPath);
      }

      if (!dataResult) {
        return obj;
      }

      obj = dataResult;
    }

    if (!obj) {
      return null;
    }

    res = obj[lang];

    if (!res) {
      if (strict) {
        return null;
      }
      res = obj.en || obj.gr;
    }

    if(_.isString(res)){
      res = this.render(res,templateData);
    }

    return res;
  });

  /////////////////////////////////////////////////////////////////
  // GET TITLE
  /////////////////////////////////////////////////////////////////


  project.extend.helper.register('get_title', function(page, lang, strict) {

    var title = page.title;

    if (title) {
      var lng = this.lng(title, lang, strict);
      if (lng) {
        return lng;
      }
    }

    return null;
  });

  /////////////////////////////////////////////////////////////////
  // HAS LANGUAGE AVAILABLE
  /////////////////////////////////////////////////////////////////

  project.extend.helper.register('has_lang', function(page, lang) {

    lang = lang || project.site.lang;
    var title = this.get_title(page, lang);
    return title ? true : false;
  });


  /////////////////////////////////////////////////////////////////
  // Render EJS template code
  /////////////////////////////////////////////////////////////////

  project.extend.helper.register('render_template', function(content, data) {
    if (!content) {
      return;
    }
    return ejs.render(content, data);
  });

  /////////////////////////////////////////////////////////////////
  // Scan Object for language proprties
  /////////////////////////////////////////////////////////////////

  project.extend.helper.register('lngScan', function(mainObj,lng) {

    var self = this;

    function scan(obj) {

      if (!obj) {
        return;
      }

      if (!_.isObject(obj) && !_.isArray(obj)) {
        return;
      }

      for (var key in obj) {

        var source = obj[key];

        if(
          _.isObject(source) && !_.keys(source).length
        ){
          obj[key] = null;
          continue;
        }

        var res = self.lng(source,lng);

        if (res) {

          obj[key] = res;

        } else {
          scan(source);
        }
      }
    }

    var result = JSON.stringify(mainObj);
    if(!result){
      return;
    }
    result = JSON.parse(result);
    scan(result);

    return result;
  });

};
