function _e_directives(app) {

  app.directive('showOnRole', function() {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {

        console.log('attrs',JSON.parse(attrs.showOnRole));
      }
    };
  });
}
