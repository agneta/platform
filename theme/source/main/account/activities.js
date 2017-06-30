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
