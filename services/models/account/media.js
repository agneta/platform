const path = require('path');

module.exports = function(Model) {

  Model.__mediaLocation = function(options){
    var accountId = options.accountId;
    if(!accountId){
      throw new Error('Account id is missing');
    }
    return path.join('account',accountId,options.path);
  };

};
