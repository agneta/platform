/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/email_template/render.js
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
const cheerio = require('cheerio');
const _ = require('lodash');

module.exports = function(Model,app) {

  Model.render = function(name, lng) {
    var template;
    return Promise.resolve()
      .then(function() {
        template = Model.__email.templates[name];

        if(!template){
          return Promise.reject({
            statusCode: 400,
            message: `Email template could not be found with name ${name}`
          });
        }

        return template.render({
          language: lng
        });
      })
      .then(function(result) {
        //console.log('email html',result);
        var $ = cheerio.load(result.html);
        var html = $.html(changeTag.call($('body'), $, 'div'));
        return {
          name: name,
          html: html,
          data: app.lngScan(_.pick(template.data,['subject','from']),lng)
        };

      });

  };

  function changeTag($, tag) {
    var replacement = $('<' + tag + '>');
    replacement.attr(this[0].attribs);
    replacement.data(this.data());
    replacement.append(this.children());
    return replacement;
  }

  Model.remoteMethod(
    'render', {
      description: 'Render an email template',
      accepts: [{
        arg: 'name',
        type: 'string',
        required: true
      }, {
        arg: 'lng',
        type: 'string',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/render'
      }
    }
  );

};
