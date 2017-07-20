/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/account/activities.js
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
  var feeds = {};

  app.run(function($rootScope, $q, Activity_Feed) {

    $rootScope.getFeed = function(id) {
      return feeds[id];
    };

    $rootScope.loadFeed = function(id) {

      if(!id){
        return $q.resolve();
      }

      var feed = feeds[id];

      if (feed) {
        return $q.resolve(feed);
      }

      return Activity_Feed.load({
        id: id
      })
        .$promise
        .then(function(result) {
          feeds[result.id] = result;
          return result;
        });
    };

    $rootScope.loadFeeds = function(activities) {

      var chain = $q.resolve();

      activities.forEach(function(activity) {
        chain = chain.then(function() {
          return $rootScope.loadFeed(activity._id.actionId);
        });
      });

      return chain;
    };

  });

})();
