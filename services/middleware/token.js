/*   Copyright 2017 Agneta Network Applications, LLC.
*
*   Source file: services/middleware/token.js
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
const Promise = require('bluebird');
module.exports = function(app) {

  function rewriteUserLiteral(req, currentUserLiteral) {
    if (req.accessToken && req.accessToken.userId && currentUserLiteral) {
      // Replace /me/ with /current-user-id/
      var urlBeforeRewrite = req.url;
      req.url = req.url.replace(
        new RegExp('/' + currentUserLiteral + '(/|$|\\?)', 'g'),
        '/' + req.accessToken.userId + '$1');
      if (req.url !== urlBeforeRewrite) {
        //debug('req.url has been rewritten from %s to %s', urlBeforeRewrite,  req.url);
      }
    }
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  var name = app.web.services.get('token').name;

  var options = {
    searchDefaultTokenKeys: false,
    cookies: [name],
    headers: [name],
    params: [name]
  };

  var currentUserLiteral = options.currentUserLiteral;
  if (currentUserLiteral && (typeof currentUserLiteral !== 'string')) {
    //debug('Set currentUserLiteral to \'me\' as the value is not a string.');
    currentUserLiteral = 'me';
  }
  if (typeof currentUserLiteral === 'string') {
    currentUserLiteral = escapeRegExp(currentUserLiteral);
  }

  function middleware(req, res, next) {

    req.accessTokens = req.accessTokens || {};

    if (req.accessToken === undefined) {
      Object.defineProperty(req, 'accessToken', {
        get: function() {
          var key = req.app.web.services.get('token').name;
          return req.accessTokens[key] || null;
        }
      });
    }

    app.models.AccountToken.findForRequest(req, options, function(err, token) {
      if (err) {
        return next(err);
      }

      if (!token || !app.roles) {
        return next();
      }

      var account;
      var ip = req.ip || req.connection.remoteAddress;

      return Promise.resolve()
        .then(function() {

          return app.models.Account_IP.count({
            accountId: token.userId,
          })
            .then(function(count) {
              if(!count){
                return;
              }

              return app.models.Account_IP.findOne({
                where:{
                  accountId: token.userId,
                  address: ip
                },
                fields: {
                  id: true
                }
              })
                .then(function(accountIp) {

                  if (!accountIp) {
                    return Promise.reject(`Account cannot be accessed with your IP: ${ip}`);
                  }
                });

            });
        })
        .then(function() {

          return app.models.Account.findById(token.userId, {
            include: app.roles.include,
            fields: {
              id: true
            }
          });
        })
        .then(function(_account) {
          account = _account;
          if (!account) {

            res.clearCookie(name, {
              signed: req.signedCookies ? true : false
            });

            return app.models.Account.logout(token.id)
              .then(function(){
                return Promise.reject(
                  new Error('Account not found from access token')
                );
              });

          }
          //console.log(account._ip_whitelist,ip);

          save({
            account: account,
            token: token,
            req: req
          });

        })
        .asCallback(next);
    });

  }

  function save(options) {

    var account = options.account;
    var token = options.token;
    var req = options.req;

    var roles = _.omit(account.__data, 'id');
    roles = _.mapValues(roles, function(value) {
      return value.id;
    });

    token = token.__data;
    token.roles = roles;
    token.account = account;

    //console.log('middleware:token:save',name,token);

    req.accessTokens[name] = token || null;
    rewriteUserLiteral(req, currentUserLiteral);
  }

  app.token = {
    middleware: middleware,
    save: save
  };

  return middleware;

};
