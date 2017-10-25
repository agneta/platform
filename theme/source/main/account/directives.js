function _e_directives(app) {

  app.directive('hasRole', function($rootScope) {
    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs) {

        var parent = element.parent();
        parent.addClass('has-role');

        function check() {

          var account = $rootScope.account;
          if(!account){
            return;
          }

          var roles = JSON.parse(attrs.hasRole) || [];
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
            parent.removeClass('has-no-role');
          } else {
            parent.addClass('has-no-role');
          }

        }

        check();

        $rootScope.$on('accountCheck',check);


      }
    };
  });
}
