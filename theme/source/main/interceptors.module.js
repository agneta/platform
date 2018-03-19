/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/interceptors.module.js
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
(function() {

  var agneta = window.agneta;
  var angular = window.angular;

  var app = angular.module('MainApp');

  app.config(function($httpProvider) {

    $httpProvider.defaults.useXDomain = true;

    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    var errors = agneta.errors;

    $httpProvider.interceptors.push(function($q, $rootScope, $injector, LoopBackAuth) {

      return {
        request: function(config) {

          // Check if it is an API call
          if (config.url.indexOf(agneta.services.url) === 0) {

            var data;

            switch (config.method) {
              case 'GET':
                config.params = config.params || {};
                data = config.params;
                data.__version = new Date().valueOf();
                break;
              case 'POST':
                config.data = config.data || {};
                data = config.data;
                break;
            }

            data.language = agneta.lang;
            if (data.__endpoint) {
              //console.log(config, data.__endpoint);

              var overrideURL = config.url;
              overrideURL = overrideURL.replace(agneta.services.url, data.__endpoint);
              config.url = overrideURL;

              //console.log(overrideURL);
            }

            config.withCredentials = true;

          }

          return config;
        },
        response: function(response) {

          if (response.config.url.indexOf(agneta.services.url) !== 0) {
            return response;
          }

          var success = response.data && response.data.success;

          if (success) {

            var $mdDialog = $injector.get('$mdDialog');

            if (!(response.config.data && response.config.data.__skipDialog)) {
              $mdDialog.open({
                partial: 'success',
                //nested: true,
                data: {
                  title: success.title,
                  content: success.message || success.content || success
                }
              });
            }

          }

          return response;
        },
        responseError: function(rejection) {

          var error;
          if (rejection.data) {
            error = rejection.data.error || rejection.data;
          }
          if (!error) {
            error = {
              message: errors.message
            };
          }

          function handleRejection() {

            if (
              rejection.config &&
              rejection.config.url &&
              rejection.config.url.indexOf(agneta.services.url) !== 0) {
              return;
            }

            var code = error && error.code;

            switch (code) {
              case 'NO_USER_WITH_TOKEN':
                console.warn('No user with token.');
                LoopBackAuth.clearUser();
                LoopBackAuth.clearStorage();
                LoopBackAuth.save();
                // falls through
              case 'LOGIN_FAILED_EMAIL_NOT_VERIFIED':
              case 'USER_DEACTIVATED':
                return;
            }

            var $mdDialog = $injector.get('$mdDialog');
            var message = error.message || error.errmsg;

            if (message) {

              rejection.message = message;
              $rootScope.$emit('error');
              var data = rejection.config.data || rejection.config.params;
              if (!(data && data.__skipDialog)) {
                $mdDialog.open({
                  partial: 'error',
                  nested: true,
                  data: {
                    title: error.title || errors.title,
                    content: message
                  }
                });
              }

            }

          }

          handleRejection();
          return $q.reject(error);

        }

      };
    });


  });
})();
