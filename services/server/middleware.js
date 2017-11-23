/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/middleware.js
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

module.exports = function(app) {

  var limiterOptions = [];
  var configLimiter = app.get('limiter');
  var apiRoot = app.get('restApiRoot');

  if (configLimiter.global) {
    limiterOptions.push({
      params: [app, {
        name: 'global',
        title: 'Global',
        isGlobal: true,
        options: configLimiter.global
      }],
      paths: [apiRoot]
    });
  }

  if (configLimiter.paths) {
    for (var limiter of configLimiter.paths) {
      limiterOptions.push({
        params: [app, limiter],
        paths: limiter.paths
      });
    }
  }

  var result =  {
    'initial:before': {
      'loopback#favicon': {}
    },
    initial: {
      'compression': {},
      'cors': {
        params: {
          origin: true,
          credentials: true
        }
      },
      'cookie-parser': {
        'params': app.get('cookie_secret')
      },
      'helmet#xssFilter': {},
      'helmet#frameguard': {
        params: [
          'deny'
        ]
      },
      'helmet#hsts': {
        params: {
          maxAge: 0,
          includeSubdomains: true
        }
      },
      'helmet#hidePoweredBy': {},
      'helmet#ieNoOpen': {},
      'helmet#noSniff': {},
      'helmet#noCache': {
        'enabled': false
      },
      './middleware/limiter': limiterOptions,
    },
    'initial:after': {},
    'session': {
      './middleware/session': {
        params: [app]
      }
    },
    'parse': {
      'body-parser#json': {},
      'body-parser#urlencoded': {
        'params': {
          'extended': true
        }
      }
    },
    'routes:before': {
      './middleware/token': {
        params: [app]
      },
      './middleware/certificate': {
        params: [app],
        paths: [apiRoot],
        enabled: app.get('certificate')?true:false
      }
    },
    'routes': {
      './middleware/log-request': {
        'params': [app.get('token')]
      },
      './middleware/media-private': {
        'params': [app]
      },
      './middleware/page-private': {
        'params': [app]
      },
      'loopback#rest': {
        'paths': [
          app.get('restApiRoot')
        ]
      }
    },
    'routes:after': {},
    'files': {},
    'final': {},
    'final:after': {
      'strong-error-handler': {
        'params': {
          'debug': false,
          'log': true,
          'includeStack': false
        }
      }
    }
  };



  return result;
};
