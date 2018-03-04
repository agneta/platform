/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/data.module.js
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
var app = window.angular.module('MainApp');

app.run(function(
  $rootScope,
  $http,
  $route,
  $q,
  $ocLazyLoad
) {

  $rootScope.loadData = function(options) {

    var path;
    var filter;
    var params = $route.current.params;

    if(angular.isObject(options)){
      path = options.path;
      filter = options.filter;
    }else{
      path = options;
    }

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
        var dependencies = data.dependencies || [];
        var priorityIndex = 0;
        //console.log('$rootScope.loadData', data);

        //----------------------------------------------
        // Filter Dependencies to load

        if(filter){
          var result = [];
          for(var index in dependencies){
            var filtered = [];
            for(var dep of dependencies[index]){
              if(dep.indexOf(filter)>0){
                filtered.push(dep);
              }
            }
            result[index] = filtered;
          }
          dependencies = result;
          //console.log('filtered deps', dependencies);
        }
        //----------------------------------------------
        // Load page dependencies

        function loadPriority() {

          var priority = dependencies[priorityIndex];

          if (!priority) {
            return;
          }

          priorityIndex++;

          return $q(function(resolve) {

            var options = {
              name: 'MainApp',
              files: priority
            };

            switch(agneta.env){
              case 'development':
                options.cache = false;
                break;
            }

            if (priority.length) {
              $ocLazyLoad.load([options]).then(resolve);

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

});
