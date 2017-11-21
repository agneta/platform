/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/helpers.js
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
const _ = require('lodash');
const path = require('path');
const S = require('string');
const Promise = require('bluebird');

module.exports = function(app) {

  _.omitDeep = function(collection, excludeKeys) {

    function omitFn(value) {

      if (value && typeof value === 'object') {
        excludeKeys.forEach((key) => {
          delete value[key];
        });
      }
    }

    return _.cloneDeepWith(collection, omitFn);

  };

  app.helpers = {
    mixin: function(name, Model) {
      require('../server/mixins/' + name)(Model);
    },
    omitDeep: _.omitDeep,
    mediaType: function(mimeType) {

      if (!mimeType) {
        return;
      }

      var typeParsed = mimeType.split('/');
      var mimetype = typeParsed[0];
      var mediatype = typeParsed[1];

      var type = mimetype;

      switch (mimetype) {
        case 'image':
          switch (mediatype) {
            case 'jpeg':
            case 'png':
              type = 'image';
              break;
            case 'svg+xml':
              type = 'icon';
              break;
            default:

          }
          break;
        case 'application':
          switch (mediatype) {
            case 'pdf':
              type = 'pdf';
              break;
          }
          break;
        default:

      }

      return type;
    },
    slugifyPath: function(pagePath) {
      pagePath = path.normalize(pagePath);
      pagePath = pagePath.split('/');
      if (!pagePath[0].length) {
        pagePath.shift();
      }
      if (!pagePath[pagePath.length - 1].length) {
        pagePath.pop();
      }
      for (var i in pagePath) {
        pagePath[i] = S(pagePath[i]).slugify().s;
      }
      return pagePath.join('/');
    },
    normalizePath: function(mediaPath) {
      mediaPath = path.normalize(mediaPath);

      if (mediaPath[0] == '/') {
        mediaPath = mediaPath.substring(1);
      }

      if (mediaPath.substr(-1) === '/') {
        mediaPath = mediaPath.substr(0, mediaPath.length - 1);
      }

      return mediaPath;
    },
    dropCollection: function(names) {

      names = _.isArray(names) ? names : [names];

      var db = app.dataSources.db.connector.db;

      return Promise.resolve()
        .then(function() {
          return db.listCollections()
            .toArray();
        })
        .then(function(list) {
          return Promise.map(names, function(name) {

            if (_.find(list, {
              name: name
            })) {
              return db.collection(name).drop();
            }

          });
        })
        .then(function() {
          return app.indexes.autoupdate(names);
        });

    },
    limitObject: function(data, options) {

      var depth = options.depth || 3;

      function check(collection,options) {

        //console.log('depthIndex',options.depth,depth);
        var newCollection;
        if (_.isObject(collection)) {
          newCollection = {};
        }

        if (_.isArray(collection)) {
          newCollection = [];
        }

        if (!newCollection) {
          return collection;
        }

        if (options.depth > depth) {
          return;
        }

        var keys = _.keys(collection);

        keys.map(function(key) {
          var value = collection[key];

          if (_.isFunction(value)) {
            return;
          }
          var checkValue = check(value,{
            depth: options.depth +1
          });
          if(!_.isUndefined(checkValue)){
            newCollection[key] = checkValue;
          }
        });

        if(!_.size(newCollection)){
          return;
        }
        return newCollection;
      }

      return check(data,{
        depth: 1
      });
    },
    resubmitPassword: function(ctx, user, next) {

      var accessToken = ctx.req.accessToken;

      // Skip password confirmation for short term tokens
      if (accessToken.ttl < 1000) {
        return next();
      }

      var body = ctx.req.body;
      var password = body.password || body.password_old;

      if (!password) {
        return next({
          code: 'CONFIRM_PASS_REQUIRED',
          message: 'Password is required'
        });
      }

      app.models.Account.findById(accessToken.userId)
        .then(function(currentUser) {
          return currentUser.hasPassword(password);
        })
        .then(function(isMatch) {
          if (!isMatch) {
            return next({
              code: 'CONFIRM_PASS_WRONG',
              message: 'Could not confirm your request because you entered a wrong password'
            });
          }
          next();
        })
        .catch(next);
    }

  };
};
