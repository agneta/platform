const _ = require('lodash');
module.exports = function(){

  return function(options) {

    var where = options.where;
    var prop = options.prop;
    var model = options.model;
    var limit = options.limit || 40;

    return Promise.resolve()
      .then(function() {
        return model.find({
          skip: limit-1,
          limit: 1,
          order: `${prop} DESC`,
          where:where
        });
      })
      .then(function(result){

        //console.log('result',result);
        result = result[0];

        if(!result){
          return;
        }

        var deleteWhere = _.extend({},where);
        var value = result[prop];

        if(!value){
          throw new Error(`Cannot find value with prop: ${prop}`);
        }

        if(options.isDate){
          value = new Date(value);
        }

        deleteWhere[prop] = {
          lt: value
        };

        return model.deleteAll(deleteWhere);
      });

  };
};
