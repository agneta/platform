var app = window.angular.module('MainApp');

app.run(function(
  $rootScope,
  $http,
  $route,
  $q,
  $ocLazyLoad
) {

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

});
