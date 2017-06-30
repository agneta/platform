(function() {
    app.run(function($rootScope, LoopBackAuth, $mdDialog, $route, Account, $location, $templateCache) {

        $rootScope.signIn = function(credentials, cb) {

            Account.signIn(credentials, function(account) {
                LoopBackAuth.rememberMe = true;
                LoopBackAuth.setUser(account.token.id, account.token.userId);
                LoopBackAuth.save();
                onAccount(account);
                reload();
                cb(null, account);
            }, cb);
        };

        $rootScope.signOut = function(cb) {

            cb = cb || function() {

            };

            $rootScope.loadingMain = true;

            Account.signOut(function() {
                LoopBackAuth.clearUser();
                LoopBackAuth.clearStorage();
                LoopBackAuth.save();
                $rootScope.account = null;
                $rootScope.$emit('accountCheck', null);
                reload();
                cb();
                $rootScope.loadingMain = false;
            }, cb);
        };

        $rootScope.me = function(fn) {

            //TODO: Somehow reload loopback auth from storage
            //LoopBackAuth.load();

            (function(cb) {

                Account.me({}, function(data) {
                    cb(data);
                });

            })(function(account) {
                onAccount(account);
                fn && fn();
            });

        };

        function onAccount(account) {

            if (account && account.email) {
                $rootScope.account = account;
            } else {
                $rootScope.account = null;
            }

            $rootScope.accountChecked = true;
            $rootScope.$emit('accountCheck', account);


        }

        function reload() {
            window.location.href = $location.path();
        }

        $rootScope.dialogLogin = function() {
            $mdDialog.open({
                partial: 'log-in'
            });
        };

        ////////////////////////////////////////////////////////////////
        // Check if User is logged in
        ////////////////////////////////////////////////////////////////

        $rootScope.me(function() {
            var result = document.getElementsByClassName("user-check");
            angular.element(result).removeClass('user-check');
        });
    });
})();
