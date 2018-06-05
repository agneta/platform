const path = require('path');

module.exports = function(Model,app) {

  require('./update')(Model,app);
  require('./upload')(Model,app);
  require('./get')(Model,app);

  Model.__mediaLocation = function(options){
    var accountId = options.accountId;
    if(!accountId){
      throw new Error('Account id is missing');
    }
    return path.join('account',accountId,options.path||'');
  };

};
