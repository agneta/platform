/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/scroll.module.js
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
var app = angular.module('MainApp');
var scrollParent;

app.run(function($rootScope, $mdUtil, $timeout, $location) {

  $rootScope.scrollTop = function() {
    $mdUtil.animateScrollTo(scrollParent, 0, 500);
  };
  $rootScope.scrollTo = function(eID) {
    var elm = document.getElementById(eID);

    if(!elm){
      return;
    }
    $timeout(function() {
      $location.hash(eID);
      var position = elmYPosition(eID);
      //console.log(position);
      $mdUtil.animateScrollTo(scrollParent, position, 500);
    }, 300);
  };

});


app.directive('docsScrollClass', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {

      scrollParent = element.parent().parent()[0];
      var isScrolling = false;

      updateState();

      scrollParent.addEventListener('scroll', updateState);

      function updateState() {

        var newState = scrollParent.scrollTop > 400;
        if (newState !== isScrolling) {
          element.toggleClass(attr.docsScrollClass, newState);
        }

        isScrolling = newState;
      }
    }
  };
});

app.directive('autoScroll', function($document, $timeout, $window, $location) {
  return {
    restrict: 'A',
    link: function(scope, element) {

      var elm = element[0];
      scope.okSaveScroll = true;
      scope.scrollPos = {};

      element.bind('scroll', function() {
        if (scope.okSaveScroll) {
          scope.scrollPos[$location.path()] = elm.scrollTop;
        }
      });

      scope.scrollClear = function(path) {
        scope.scrollPos[path] = 0;
      };

      scope.$on('$viewContentLoaded', function() {
        $timeout(function() {
          elm.scrollTop = scope.scrollPos[$location.path()] ? scope.scrollPos[$location.path()] : 0;
          scope.okSaveScroll = true;
        }, 0);
      });

      scope.$on('$locationChangeStart', function() {
        scope.okSaveScroll = false;
      });
    }
  };
});

function elmYPosition(eID) {
  var elm = document.getElementById(eID);
  return elm.offsetTop;
}
