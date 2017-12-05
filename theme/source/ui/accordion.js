/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/ui/accordion.js
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
(function(){
  var activeScope;
  var scopeCount = 0;

  var app = window.angular.module('MainApp', window.angularDeps);
  app.controller('MenuItemCtrl', function($rootScope, $element, $timeout) {
    var vm = this;
    vm.expanded = false;
    vm.id = scopeCount++;
    var element = $element[0];
    var list = element.querySelector('.list');
    vm.$watch('expanded', function() {

      if (vm.expanded) {
        list.style.transition = 'none';
        list.style['margin-top'] = -list.offsetHeight;
        $timeout(function() {
          list.style.transition = null;
          list.style['margin-top'] = null;
        }, 100);
        vm.expandedClass = true;
      } else {
        if(list.offsetHeight>0){
          list.style['margin-top'] = -list.offsetHeight;
        }
        $timeout(function() {
          vm.expandedClass = false;
        }, 600);
      }
    });

    vm.toggleView = function() {

      vm.expanded = !vm.expanded;

      //

      var skip = (function() {

        var parent = vm.$parent;

        while (parent) {
          if (parent.expanded) {
            if (activeScope && activeScope.id == parent.id) {
              return true;
            }
          }
          parent = parent.$parent;
        }

        return false;

      })();

      if (!skip) {
        close();
      }

      function close() {
        if (activeScope) {
          var parent = activeScope.$parent;
          while (parent) {
            if (!vm.$parent.id) {
              parent.expanded = false;
            }
            parent = parent.$parent;
          }
          activeScope.expanded = false;
        }
      }

      //
      activeScope = vm.expanded ? vm : null;

    };
  });
})();
