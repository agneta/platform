/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/promise.module.js
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

var errCancel = {
  cancelled: true,
  message: 'Cancelled'
};

angular.module('angular-q-limit', [])
  .config(function($provide) {
    $provide.decorator('$q', function($delegate) {

      $delegate.wrap = function(options) {

        var cancelled = false;
        var defer = $delegate.defer();
        var isDone = false;
        return {
          init: function() {

            if (cancelled) {
              return $delegate.reject({
                message: 'Already cancelled'
              });
            }

            options.promise()
              .then(function(res) {
                if (cancelled) {
                  return;
                }
                if (options.onResolve) {
                  options.onResolve(res);
                }
                defer.resolve(res);
              })
              .catch(function(err) {
                if (cancelled) {
                  return;
                }
                if (options.onCatch) {
                  options.onCatch(err);
                }
                defer.reject(err);
              })
              .finally(function(err) {
                isDone = true;
                if (cancelled) {
                  return;
                }
                if (options.onFinally) {
                  options.onFinally(err);
                }

              });

            return defer.promise;

          },
          isCancelled: function() {
            return cancelled;
          },
          cancel: function() {
            if (isDone) {
              return;
            }
            cancelled = true;

            if (options.onCatch) {
              options.onCatch(errCancel);
            }
            if (defer) {
              defer.reject(errCancel);
            }
          }
        };


      };

      $delegate.allLimit = function(options) {

        var cancelled = false;
        var limit = options.limit || 1; // Set the initial limit
        var promises = options.promises;
        var defer = $delegate.defer();
        var promiseChecker = function(queue) {

          if (cancelled) {
            return queue.defer.reject(errCancel);
          }

          if (!queue.promisesRemaining.length && queue.running == 0) {
            return queue.defer.resolve(queue.output);
          }

          while (queue.promisesRemaining.length > 0 && queue.running < queue.limit) {
            (function(thisPromise, promiseIndex) {
              queue.running++;
              thisPromise.init()
                .then(next)
                .catch(function(err) {
                  if (options.ignoreError) {
                    next(err);
                  } else {
                    queue.defer.reject(err);
                  }
                });

              function next(data) {
                queue.output[promiseIndex] = data;
                queue.completed++;
                queue.running--;
                queue.defer.notify({
                  completed: queue.completed,
                  count: queue.promiseCount,
                  limit: queue.limit
                });
                promiseChecker(queue);
              }

            })(queue.promisesRemaining.shift(), queue.promiseIndex++);
          }
        };

        var queue = {
          limit: limit,
          running: 0,
          promiseCount: promises.length,
          completed: 0,
          defer: defer,
          promisesRemaining: [].concat(promises),
          output: [],
          promiseIndex: 0,
        };

        promiseChecker(queue);

        return {
          cancel: function() {
            promises.map(function(promise) {
              promise.cancel();
            });
            cancelled = true;
          },
          $promise: defer.promise
        };
      };

      return $delegate;
    });
  });
