function _e_directives(app) {

  app.directive('hasRole', function($rootScope) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {

        element.addClass('has-role');

        var roles = JSON.parse(attrs.hasRole) || [];
        var account = $rootScope.account;
        var hasRoles = [];

        for (var index in roles) {

          var role = roles[index];
          var hasRole = account[role];
          hasRole = hasRole && hasRole.id;

          if (hasRole) {
            hasRoles.push(role);
          }
        }

        if (hasRoles.length) {
          element.removeClass('has-no-role');
        } else {
          element.addClass('has-no-role');
        }

      }
    };
  });
}
