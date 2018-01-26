/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/account/signIn.js
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

module.exports = function(Model, app) {

  var tokenName = app.get('token').name;


  Model.signIn = function(email, username, password,req) {

    if (!email && !username) {

      var err = new Error(app.lng('account.noIdentity',req));
      err.statusCode = 400;

      throw err;
    }

    var credentials = {
      email: email,
      username: username,
      password: password
    };

    var account;
    var token;

    return Model.findOne({
      include: Model.includeRoles,
      where: {
        email: email,
        username: username
      }
    })
      .then(function(_account) {
        account = _account;

        if (!account) {

          var err1 = new Error(app.lng('account.notFound',req));
          err1.statusCode = 400;
          err1.code = 'USER_NOT_FOUND';

          throw err1;
        }

        if (account.deactivated) {

          var err2 = new Error(app.lng('account.deactivated',req));
          err2.statusCode = 400;
          err2.code = 'USER_DEACTIVATED';

          throw err2;

        }

        return Model.login(credentials, null)
          .catch(function(){
            return Promise.reject({
              statusCode: 400,
              message: app.lng('account.wrongPassword',req)
            });
          });

      })
      .then(function(_token) {
        token = _token;

        return app.helpers.limitCollection({
          where:{
            userId: token.userId
          },
          prop: 'created',
          isDate: true,
          model: app.models.AccountToken,
          limit: 10
        });

      })
      .then(function(){
        //console.log('deleted',deleted);
        account.token = token;
        return account;

      });

  };

  Model.remoteMethod(
    'signIn', {
      description: 'Login account using email and password.',
      accepts: [{
        arg: 'email',
        type: 'string',
        required: false,
      }, {
        arg: 'username',
        type: 'string',
        required: false,
      }, {
        arg: 'password',
        type: 'string',
        required: true
      },{
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/sign-in'
      }
    }
  );

  Model.beforeRemote('signIn', function(context, account, next) {

    if (context.req.accessToken) {

      Model.signOut(context.req)
        .then(function() {
          next();
        });

      return;
    }

    next();
  });

  Model.afterRemote('signIn', function(context, account, next) {

    Model.activity({
      req: context.req,
      accountId: account.id,
      action: 'login'
    });

    next();

  });

  Model.afterRemote('signIn', function setLoginCookie(context, account, next) {

    Model.__setLoginCookie({
      token: account.token,
      res: context.res,
      req: context.req
    });
    return next();
  });

  Model.__setLoginCookie = function(options){

    var token = options.token;
    var res = options.res;
    var req = options.req;

    if (token !== null) {
      if (token.id !== null) {
        res.cookie(tokenName, token.id, {
          signed: req.signedCookies ? true : false,
          maxAge: 1000 * token.ttl
        });
      }
    }

  };


};
