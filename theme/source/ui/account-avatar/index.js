var app = angular.module('MainApp');

app.directive('agAccountAvatar', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      if (!ngModel) return;

      scope.$watch(attrs.ngModel, function(account) {
        if(!account){
          return;
        }
        var picture = account.picture;
        if(account.picturePrivate){
          picture = agneta.prv_media(account.picturePrivate,'small');
        }
        scope.picture = picture;
      });

    }
  };
});
