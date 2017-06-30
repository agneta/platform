(function() {

    var app = window.angular.module('MainApp');

    app.controller('RecaptchaCtrl', function($scope, $element, $attrs, $timeout, $parse, $ocLazyLoad) {

        var element = $element[0];

        window.onloadRecaptcha = function() {
            window.grecaptcha.render(element, {
                sitekey: agneta.keys.recaptcha,
                callback: function(response) {
                    $timeout(function() {
                        $parse($attrs.ngModel).assign($scope.$parent, response);
                    }, 10);
                }
            });
        };

        if (window.grecaptcha) {
            window.onloadRecaptcha();
        }

        $ocLazyLoad.load({
            files: [
                '//www.google.com/recaptcha/api.js?onload=onloadRecaptcha&render=explicit&hl=el'
            ]
        });

    });


})();
