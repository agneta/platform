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
    console.error(exception.stack);
  };
});

//---------------------------------------------------------------


app.config(function($mdThemingProvider, $sceDelegateProvider) {

  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    agneta.services.url + '/**',
    agneta.server.media + '/**',
    agneta.server.lib + '/**'
  ]);

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

  $rootScope.loadData = function(path) {

    var params = $route.current.params;
    path = path || params.path;

    var dataPath = agneta.urljoin({
      path: [agneta.services.view, path, 'view-data'],
      query: {
        version: agneta.page.version
      }
    });

    var data;

    return $http.get(dataPath)
      .then(function(response) {

        data = app.pageData = response.data;
        //console.log('$rootScope.loadData', data);

        //----------------------------------------------
        // Load page dependencies

        var dependencies = data.dependencies || [];
        var priorityIndex = 0;

        function loadPriority() {

          var priority = dependencies[priorityIndex];

          if (!priority) {
            return;
          }

          priorityIndex++;

          return $q(function(resolve) {

              if (priority.length) {

                $ocLazyLoad.load([{
                  name: 'MainApp',
                  files: priority
                }]).then(resolve);

              } else {
                resolve();
              }

            })
            .then(loadPriority);

        }

        //----------------------------------------------
        // Load angular modules

        if (data.inject && data.inject.length) {
          $ocLazyLoad.inject(data.inject);
        }

        return loadPriority();


      })
      .then(function() {
        return data;
      });
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
    return $rootScope.account ? 'logged-in' : 'logged-out';
  };
});

app.filter('filesize', function() {

  return function(bytes) {

    return window.filesize(bytes);

  };

});


app.filter('highlight', function($sce) {
  return function(text, phrase) {
    if (!text) {
      return;
    }
    if (!phrase) {
      return text;
    }
    phrase = phrase.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[]\\\/]/gi, '');
    phrase = phrase.split(' ').join('|');
    text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
      '<span class="highlighted">$1</span>');
    return $sce.trustAsHtml(text);
  };
});

app.filter('highlight_fuse', function($sce) {

  var wrapStart = '<span class="highlighted">';
  var wrapEnd = '</span>';
  var wrapSize = wrapStart.length + wrapEnd.length;

  return function(text, matches, name) {

    if (!text) {
      return;
    }
    if (!matches || !matches.length) {
      return text;
    }

    for (var key in matches) {
      var match = matches[key];

      if (match.key != name) {
        continue;
      }

      var offset = 0;
      for (var keyIndices in match.indices) {
        var indice = match.indices[keyIndices];
        var start = indice[0] + offset;
        var end = indice[1] + offset + 1;
        text = text.substring(0, start) + wrapStart + text.substring(start, end) + wrapEnd + text.substring(end);
        offset += wrapSize;
      }
    }

    return $sce.trustAsHtml(text);
  };
});

app.directive('agKeydown', function() {
  return {
    restrict: 'A',
    link: function(scope, elem) {
      elem.on('keydown', function(ev) {
        ev.stopPropagation();
      });
    }
  };
});

app.directive('onEnter', function() {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function(event) {
      if (event.keyCode === 13) {
        scope.$apply(function() {
          scope.$eval(attrs.onEnter);
        });

        event.preventDefault();
      }
    });
  };
});

app.directive('focusMe', function($timeout) {
  return {
    scope: {
      trigger: '@focusMe'
    },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if (value === 'true') {
          $timeout(function() {
            element[0].focus();
          });
        }
      });
    }
  };
});

app.directive('compareTo', function() {
  return {
    require: 'ngModel',
    scope: {
      otherModelValue: '=compareTo'
    },
    link: function(scope, element, attributes, ngModel) {

      ngModel.$validators.compareTo = function(modelValue) {
        return modelValue == scope.otherModelValue;
      };

      scope.$watch('otherModelValue', function() {
        ngModel.$validate();
      });
    }
  };
});

require('main/search-engine.module');
require('main/route.module');
require('main/form.module');
require('main/scroll.module');
require('main/dialog.module');
require('main/menu-side.module');
