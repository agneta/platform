/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/route.js
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

  app.config(function($routeProvider, $locationProvider) {

    ////////////////////////////////////////////////////////////////////

    function versionURL(path) {

      return agneta.urljoin({
        path: [agneta.services.view, path, 'view'],
        query: {
          version: agneta.page.version
        }
      });
    }

    ////////////////////////////////////////////////////////////////////

    var routePath = agneta.url('/:path*');

    $routeProvider
      .when('*', {
        reloadOnSearch: false
      })
      .when('/', {
        templateUrl: function(params) {
          var result = versionURL(agneta.lang);
          return result;
        },
        reloadOnSearch: false,
        resolve: {
          data: function($rootScope) {
            return $rootScope.loadData(agneta.lang);
          }
        }
      })
      .when(routePath, {
        templateUrl: function(params) {
          var result = versionURL(params.path);
          return result;
        },
        reloadOnSearch: false,
        resolve: {
          data: function($rootScope) {
            return $rootScope.loadData();
          }
        }
      })
      .otherwise({
        redirect: true
      });

    // use the HTML5 History API
    $locationProvider.html5Mode(true);

  });

  app.controller('ViewCtrl', function($scope, $rootScope, $route, $timeout, $location, Account, $mdDialog) {

    var wrapper = document.getElementById('wrap');


    $rootScope.$on('$routeChangeStart', function(event, current, previous) {

      $rootScope.loadingMain = true;
      var searchData = $location.search();
      delete searchData.version;
      $location.search(searchData);

    });

    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {

      var url;

      //----------------------------------------------
      if (rejection.unauthorized) {
        $mdDialog.open({
          partial: 'unauthorized',
          data: {}
        });
      }

      if (rejection.login) {
        $mdDialog.open({
          partial: 'log-in',
          data: {}
        });
      }

      console.error(rejection);

      /*
            if (previous) {

                var testPath = agneta.url_web + current.params.path;
                var checkPath = window.location.href;

                if (previous.loadedTemplateUrl == current.loadedTemplateUrl) {
                    return;
                }

                url = agneta.url(current.params.path);
            } else {
                url = current.loadedTemplateUrl;
            }
            if (url) {
                window.location.href = url;
            }*/


    });

    $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {

      if (current.redirect) {
        window.location.href = $location.path();
        return;
      }
      if (!current) {
        console.error('View did not load correctly');
        return;
      }

      //

      var queryString = $location.url().split('?')[1];
      if (queryString) {
        queryString = '?' + queryString;
      }
      $rootScope.queryString = queryString;

      //

      var data = current.locals.data;
      $rootScope.viewData = data;
      $rootScope.loadingMain = false;


    });
  });


})();
