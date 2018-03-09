/*   Copyright 2017 Agneta Network Applications, LLC.
*
*   Source file: theme/source/main.js
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


require('main/promise.module');
require('main/helpers.module');

var agneta = window.agneta;
var app = window.angular.module('MainApp',
  window.angularDeps.concat(['angular-q-limit'])
);

//---------------------------------------------------------------
var injector = angular.injector(['ng']);

(function() {

  var directives = {};
  var overrides = {};

  function fixName(name) {
    return name[0].toLowerCase() + name.slice(1);
  }

  function argInjectors(names, override) {
    override = override || {};
    var result = [];
    //console.log('argInjectors.names', names);
    for (var index in names) {
      var name = names[index];
      var service = override[name];
      //console.log('argInjectors.service', name, service);
      if (!service) {
        service = injector.get(name);
      }
      result.push(service);
    }
    return result;
  }

  agneta.addOverride = function(name, override) {
    //console.log('agneta.addOverride', name, override);
    if (!name) {
      return;
    }
    name = fixName(name);
    overrides[name] = override;
  };

  agneta.extend = function(vm, directiveName, override) {

    directiveName = fixName(directiveName);
    var directive = directives[directiveName];

    if (!directive) {
      console.error('Cannot find directive with name ' + directiveName);
      return;
    }

    directive.link.apply(vm,
      argInjectors(directive.parameters,
        angular.extend({
          data: {}
        }, override)
      ));
  };

  agneta.directive = function(name, link) {
    name = fixName(name);

    var parameters;

    if (link) {
      if (Array.isArray(link)) {
        var _link = link.pop();
        parameters = link;
        link = _link;
      } else {
        parameters = getParamNames(link);
      }
    } else {
      parameters = [];
    }

    directives[name] = {
      parameters: parameters,
      link: link
    };

    angular.module('MainApp').directive(name, function() {

      return {
        restrict: 'A',
        link: function(vm, elm, attrs) {
          if (link) {
            var override = {
              '$element': elm,
              '$attrs': attrs
            };
            if (overrides[name]) {
              angular.extend(override, overrides[name]);
            }
            link.apply(vm, argInjectors(parameters, override));
          }
        }
      };
    });

  };

  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var ARGUMENT_NAMES = /([^\s,]+)/g;

  function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
      result = [];
    return result;
  }

})();

//---------------------------------------------------------------

app.factory('$exceptionHandler', function() {
  return function(exception) {
    console.error(exception.stack || exception);
  };
});

//---------------------------------------------------------------


app.config(function($mdThemingProvider, $sceDelegateProvider, $qProvider) {

  $qProvider.errorOnUnhandledRejections(false);
  var trustList = [
    'self',
    agneta.services.url + '/**',
    agneta.server.media + '/**',
    agneta.server.lib + '/**'
  ];
  $sceDelegateProvider.resourceUrlWhitelist(trustList);

  //////////////////////////////////////////////////////////////
  // Theme
  //////////////////////////////////////////////////////////////

  function definePalette(name, color) {

    var lum = agneta.colorLuminance;

    $mdThemingProvider.definePalette(name, {
      '50': lum(color, -0.5),
      '100': lum(color, -0.4),
      '200': lum(color, -0.3),
      '300': lum(color, -0.2),
      '400': lum(color, -0.1),
      '500': lum(color, 0),
      '600': lum(color, 0.05),
      '700': lum(color, 0.1),
      '800': lum(color, 0.15),
      '900': lum(color, 0.2),
      'A100': lum(color, 0.25),
      'A200': lum(color, 0.3),
      'A400': lum(color, 0.25),
      'A700': lum(color, 0.3),
      'contrastDefaultColor': 'light', // whether, by default, text (contrast)
      // on this palette should be dark or light
      'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
        '200', '300', '400', 'A100'
      ],
      'contrastLightColors': undefined // could also specify this if default was 'dark'
    });

  }

  definePalette('primary', agneta.theme.primary);
  definePalette('accent', agneta.theme.accent);

  $mdThemingProvider.theme('default')
    .primaryPalette('primary')
    .accentPalette('accent', {
      default: '500'
    })
    .warnPalette('red');

}).run(function($mdMedia, $http, Account, $rootScope, $injector, $ocLazyLoad, $route, $timeout, $location, $mdSidenav, $q, $log, $mdDialog) {

  $location.path(agneta.url(agneta.path), false);
  injector = $injector;

  if(agneta.locale){
    $ocLazyLoad.load({
      files: [
        agneta.get_asset('lib/angular-i18n/angular-locale_'+agneta.locale+'.js')
      ]
    });
  }

  ////////////////////////////////////////////////////////////////


  $rootScope.$mdMedia = $mdMedia;

  $rootScope.mediaClass = function() {
    var result = [];
    var check = ['xs', 'sm', 'md', 'gt-xs', 'gt-sm', 'gt-md'];
    for (var key in check) {
      var item = check[key];
      if ($mdMedia(item)) {
        result.push('media-' + item);
      }
    }
    return result.join(' ');
  };

  ////////////////////////////////////////////////////////////////

  $rootScope.modalFrame = function(source) {

    $mdDialog.open({
      data: {
        source: source
      },
      partial: 'iframe'
    });

  };

  ////////////////////////////////////////////////////////////////
  $rootScope.playVideo = function(sources) {

    $rootScope.dialog({
      partial: 'video',
      data: {
        sources: sources
      }
    });

  };

  ////////////////////////////////////////////////////////////////

  $rootScope.pageTitle = function() {
    if (!$rootScope.viewData) {
      return agneta.title;
    }
    return agneta.title + ' | ' + $rootScope.viewData.title;
  };

  ////////////////////////////////////////////////////////////////

  $rootScope.urlActive = function(viewLocation) {
    return viewLocation === $location.path();
  };

  $rootScope.urlActiveClass = function(viewLocation) {
    if ($rootScope.urlActive(viewLocation)) {
      return 'active';
    } else {
      return '';
    }
  };

  $rootScope.get_media = agneta.get_media;
  $rootScope.get_avatar = agneta.get_avatar;
  $rootScope.get_asset = agneta.get_asset;
  $rootScope.get_icon = agneta.get_icon;
  $rootScope.get_path = agneta.langPath;


  $rootScope.url = agneta.url;
  $rootScope.lng = agneta.lng;

  $rootScope.loggedClass = function() {
    return $rootScope.account.profile ? 'logged-in' : 'logged-out';
  };
});

require('main/search-engine.module');
require('main/data.module');
require('main/filters.module');
require('main/directives.module');
require('main/route.module');
require('main/form.module');
require('main/scroll.module');
require('main/dialog.module');
require('main/menu-side.module');
require('main/interceptors.module');
require('main/account.module');
require('main/menu-context.module');
