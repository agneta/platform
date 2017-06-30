var path = require('path');
var chalk = require('chalk');

module.exports = function(app) {

    var config = {
        "routes:before": {}
    };

    var enableAuth = process.env.DISABLE_AUTH ? false : true;
    if(!enableAuth){
      console.log(chalk.bgYellow('Portal Authorization is disabled.'));
    }
    config["routes:before"][path.join(__dirname, "middleware/auth-portal")] = {
        params: [app],
        enabled: enableAuth
    };

    return config;
};
