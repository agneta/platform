/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/error-client.js
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
