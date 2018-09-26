/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/middleware.js
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

require('compression');
require('cors');

module.exports = function(app) {
  var limiterOptions = [];
  var configLimiter = app.web.services.get('limiter');
  var apiRoot = app.web.services.get('restApiRoot');

  if (configLimiter.global) {
    limiterOptions.push({
      params: [
        app,
        {
          name: 'global',
          title: 'Global',
          isGlobal: true,
          options: configLimiter.global
        }
      ],
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

  var result = {
    'initial:before': {
      'loopback#favicon': {},
      './middleware/health': {
        paths: ['/health']
      }
    },
    initial: {
      compression: {},
      cors: {
        params: {
          origin: true,
          credentials: true
        }
      },
      'cookie-parser': {
        params: app.secrets.get('cookie')
      },
      'helmet#xssFilter': {},
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
        enabled: false
      },
      './middleware/frameguard': {
        params: [app]
      }
    },
    'initial:after': {},
    session: {
      './middleware/session': {
        params: [app]
      }
    },
    parse: {
      'body-parser#json': {},
      'body-parser#urlencoded': {
        params: {
          extended: true
        }
      }
    },
    'routes:before': {
      './middleware/certificate': {
        params: [app],
        enabled: process.env.PROTOCOL == 'https'
      },
      './middleware/token': {
        params: [app]
      },
      './middleware/limiter': limiterOptions
    },
    routes: {
      './middleware/log-request': {
        params: [app.get('token')]
      },
      './middleware/media-private': {
        params: [app]
      },
      './middleware/page-private': {
        params: [app]
      },
      'loopback#rest': {
        paths: [app.web.services.get('restApiRoot')]
      }
    },
    'routes:after': {},
    files: {},
    final: {},
    'final:after': {
      'strong-error-handler': {
        params: {
          debug: false,
          log: true,
          includeStack: false
        }
      },
      './middleware/not-found': {
        enabled: process.env.MODE == 'live' ? true : false,
        params: [app]
      }
    }
  };

  return result;
};
