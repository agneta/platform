const _ = require('lodash');
module.exports = function(app) {

  app.finder.paginate = function(options){
    var params = options.req.body || options.req.query;
    var limit = params.limit || 10;
    var skip = params.skip || 0;
    var limitMax = options.max || 200;
    var filter = options.filter || {};

    if(!_.isInteger(skip)){
      return Promise.reject({
        statusCode: 400,
        message: 'Skip param must be an integer'
      });
    }

    if(!_.isInteger(limit)){
      return Promise.reject({
        statusCode: 400,
        message: 'Limit param must be an integer'
      });
    }

    if(limit>limitMax){
      return Promise.reject({
        statusCode: 400,
        message: `Your limit is exceeding the maximum value: ${limitMax}`
      });
    }

    if(limit<1){
      return Promise.reject({
        statusCode: 400,
        message: 'Limit cannot be lower than 1'
      });
    }

    filter.limit = limit;
    filter.skip = skip;

    var result = {};
    return Promise.resolve()
      .then(function(){
        return  options.model.count(filter.where);
      })
      .then(function(count){
        result.count = count;
        return  options.model.find(
          filter
        );
      })
      .then(function(list){
        result.list = list;
        return result;
      });

  };
};
