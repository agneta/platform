(function() {

    var agneta = window.agneta;
    var angular = window.angular;

    var app = angular.module('MainApp');

    app.config(function($httpProvider) {

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        var errors = agneta.errors;

        $httpProvider.interceptors.push(function($q, $rootScope, $injector, LoopBackAuth) {

            return {
                request: function(config) {

                    // Check if it is an API call
                    if (config.url.indexOf(agneta.services.url) === 0) {

                        var data;

                        switch (config.method) {
                            case "GET":
                                config.params = config.params || {};
                                data = config.params;
                                data.__version = new Date().valueOf();
                                break;
                            case "POST":
                                config.data = config.data || {};
                                data = config.data;
                                break;
                        }

                        data.language = agneta.lang;
                        config.withCredentials = true;
                    }

                    return config;
                },
                response: function(response) {

                    if (response.config.url.indexOf(agneta.services.url) !== 0) {
                        return response;
                    }

                    var success = response.data && response.data.success;

                    if (success) {

                        var $mdDialog = $injector.get('$mdDialog');

                        $mdDialog.show({
                            clickOutsideToClose: true,
                            templateUrl: agneta.partial('success'),
                            locals: {
                                data: {
                                    title: success.title,
                                    content: success.message || success.content || success
                                }
                            },
                            controller: 'DialogController'
                        });
                    }

                    return response;
                },
                responseError: function(rejection) {

                    console.error(rejection);

                    if (
                        rejection.config &&
                        rejection.config.url &&
                        rejection.config.url.indexOf(agneta.services.url) !== 0) {
                        return;
                    }

                    if (!rejection.data) {
                        return;
                    }

                    var error = rejection.data.error || rejection.data || {
                        message: errors.message
                    };
                    var code = error && error.code;

                    switch (code) {
                        case "NO_USER_WITH_TOKEN":
                            console.warn('No user with token.');
                            LoopBackAuth.clearUser();
                            LoopBackAuth.clearStorage();
                            LoopBackAuth.save();
                        case "LOGIN_FAILED_EMAIL_NOT_VERIFIED":
                        case "USER_DEACTIVATED":
                            return $q.reject(error);
                    }

                    var $mdDialog = $injector.get('$mdDialog');
                    var messages = [];

                    var message = error.message || error.errmsg;

                    if (message) {
                        messages.push(message);
                    }

                    var details = error.details;
                    if (details) {
                        for (var key in details) {
                            var detail = details[key];
                            messages.push(detail.message);
                        }
                    }

                    var html;

                    if (messages.length == 1) {
                        html = messages[0];
                    }

                    if (messages.length > 1) {
                        html = messages.join('</li><li>');
                        html = '<ul class="bullet"><li>' + html + "</li></ul>";
                    }

                    if (html) {

                        $rootScope.$emit('error');

                        $mdDialog.show({
                            clickOutsideToClose: true,
                            templateUrl: agneta.partial('error'),
                            locals: {
                                data: {
                                    title: error.title || errors.title,
                                    content: html
                                }
                            },
                            controller: 'DialogController'
                        });

                    }

                    return $q.reject(rejection);
                }
            };
        });


    });
})();
