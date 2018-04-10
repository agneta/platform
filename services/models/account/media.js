const path = require('path');
module.exports = function(Model) {

  Model.__mediaLocation = function(options){
    var req = options.req;
    var location = options.location;
    var accountId = req.accessToken.userId;
    return path.join('account',accountId,location);
  };
};
