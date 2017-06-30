(function() {

    var app = angular.module('MainApp');
    
    //-------------------------------------------

    app.factory(
        "stacktraceService",
        function() {
            return ({
                print: StackTrace.fromError
            });
        }
    );
    app.provider(
        "$exceptionHandler", {
            $get: function(errorLogService) {
                return (errorLogService);
            }
        }
    );

    app.factory(
        "errorLogService",
        function($log, $window, stacktraceService) {
            function log(exception, cause) {
                $log.error.apply($log, arguments);
                var errorMessage = exception.toString();
                var stackTrace = stacktraceService.print(exception)
                    .then(function(stack) {

                        // The stack is parsed

                        /*
                        $.ajax({
                            type: "POST",
                            url: "./javascript-errors",
                            contentType: "application/json",
                            data: angular.toJson({
                                errorUrl: $window.location.href,
                                errorMessage: errorMessage,
                                stackTrace: stackTrace,
                                cause: ( cause || "" )
                            })
                        });
                        */

                    })
                    .catch(function(loggingError) {
                        $log.warn("Error logging failed");
                        $log.log(loggingError);
                    });


            }
            return (log);
        }
    );

})();
